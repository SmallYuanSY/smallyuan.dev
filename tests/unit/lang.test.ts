// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY, initLang, readStored, shouldSuggestEnglish, writeStored } from '../../src/scripts/lang';

function memoryStorage(): () => Storage {
  const map = new Map<string, string>();
  const s = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() { return map.size; },
  } as Storage;
  return () => s;
}

const throwing: () => Storage = () => { throw new DOMException('blocked', 'SecurityError'); };

describe('shouldSuggestEnglish', () => {
  it('suggests on zh page when primary browser language is not Chinese', () => {
    expect(shouldSuggestEnglish('zh-Hant', ['en-US', 'zh-TW'], null)).toBe(true);
  });
  it('does not suggest when primary language is Chinese', () => {
    expect(shouldSuggestEnglish('zh-Hant', ['zh-TW', 'en'], null)).toBe(false);
  });
  it('does not suggest on the en page', () => {
    expect(shouldSuggestEnglish('en', ['en-US'], null)).toBe(false);
  });
  it('does not suggest once the visitor chose a language', () => {
    expect(shouldSuggestEnglish('zh-Hant', ['en-US'], 'zh')).toBe(false);
    expect(shouldSuggestEnglish('zh-Hant', ['en-US'], 'en')).toBe(false);
  });
  it('ignores unknown stored values', () => {
    expect(shouldSuggestEnglish('zh-Hant', ['en-US'], 'fr')).toBe(true);
  });
  it('does not suggest when languages are unknown', () => {
    expect(shouldSuggestEnglish('zh-Hant', [], null)).toBe(false);
  });
});

describe('storage helpers', () => {
  it('round-trips a choice', () => {
    const s = memoryStorage();
    writeStored(s, 'en');
    expect(readStored(s)).toBe('en');
    expect(s().getItem(STORAGE_KEY)).toBe('en');
  });
  it('swallows storage errors', () => {
    expect(() => writeStored(throwing, 'en')).not.toThrow();
    expect(readStored(throwing)).toBeNull();
  });
});

describe('initLang', () => {
  beforeEach(() => {
    document.documentElement.lang = 'zh-Hant';
    document.body.innerHTML = `
      <a href="/" data-lang-choice="zh">中</a>
      <a href="/en/" data-lang-choice="en">EN</a>
      <div data-lang-hint hidden><a href="/en/" data-lang-choice="en">Switch</a><button data-lang-dismiss>關閉</button></div>`;
  });

  it('shows the hint for a non-Chinese browser and hides it on dismiss', () => {
    const s = memoryStorage();
    initLang(document, { languages: ['en-US'] }, s);
    const hint = document.querySelector<HTMLElement>('[data-lang-hint]')!;
    expect(hint.hidden).toBe(false);
    document.querySelector<HTMLButtonElement>('[data-lang-dismiss]')!.click();
    expect(hint.hidden).toBe(true);
    expect(readStored(s)).toBe('zh');
  });

  it('remembers a language button click', () => {
    const s = memoryStorage();
    initLang(document, { languages: ['zh-TW'] }, s);
    document.querySelector<HTMLElement>('a[data-lang-choice="en"]')!.dispatchEvent(new Event('click'));
    expect(readStored(s)).toBe('en');
  });

  it('keeps working when storage throws', () => {
    expect(() => initLang(document, { languages: ['en-US'] }, throwing)).not.toThrow();
    const hint = document.querySelector<HTMLElement>('[data-lang-hint]')!;
    expect(hint.hidden).toBe(false);
    expect(() => document.querySelector<HTMLButtonElement>('[data-lang-dismiss]')!.click()).not.toThrow();
    expect(hint.hidden).toBe(true);
  });

  it('falls back to navigator.language when languages is empty', () => {
    initLang(document, { languages: [], language: 'ja' }, memoryStorage());
    expect(document.querySelector<HTMLElement>('[data-lang-hint]')!.hidden).toBe(false);
  });
});
