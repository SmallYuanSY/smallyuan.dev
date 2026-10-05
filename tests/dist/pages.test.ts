import { describe, expect, it } from 'vitest';
import { loadPage, readAllCss } from './helpers';

describe('routes', () => {
  it('builds zh at / with zh-Hant lang', () => {
    const doc = loadPage('/');
    expect(doc.documentElement.getAttribute('lang')).toBe('zh-Hant');
    expect(doc.title).toBe('SmallYuan');
  });

  it('builds en at /en/ with en lang', () => {
    const doc = loadPage('/en/');
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
  });

  it('cross-links languages with hreflang and canonical', () => {
    for (const [path, canonical] of [['/', 'https://smallyuan.dev/'], ['/en/', 'https://smallyuan.dev/en/']]) {
      const doc = loadPage(path);
      const alt = (l: string) => doc.querySelector(`link[rel="alternate"][hreflang="${l}"]`)?.getAttribute('href');
      expect(alt('zh-Hant')).toBe('https://smallyuan.dev/');
      expect(alt('en')).toBe('https://smallyuan.dev/en/');
      expect(alt('x-default')).toBe('https://smallyuan.dev/');
      expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonical);
    }
  });
});

describe('hero', () => {
  it('shows the zh headline with one emphasis', () => {
    const doc = loadPage('/');
    const h1 = doc.querySelector('h1')!;
    expect(h1.textContent).toBe('我把生活裡的麻煩事，一件一件做成好玩的東西。');
    expect(h1.querySelectorAll('em')).toHaveLength(1);
    expect(h1.querySelector('em')!.textContent).toBe('好玩的東西');
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });

  it('shows the en headline', () => {
    expect(loadPage('/en/').querySelector('h1')!.textContent).toBe('I turn everyday chores into things that are fun to build.');
  });
});

describe('nav', () => {
  it('marks the current language and links both', () => {
    for (const [path, current] of [['/', 'zh'], ['/en/', 'en']]) {
      const doc = loadPage(path);
      const links = [...doc.querySelectorAll('nav [data-lang-choice]')];
      expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/en/']);
      expect(doc.querySelector('nav [aria-current="page"]')!.getAttribute('data-lang-choice')).toBe(current);
    }
  });

  it('renders the English hint hidden, on the zh page only', () => {
    expect(loadPage('/').querySelector('[data-lang-hint]')!.hasAttribute('hidden')).toBe(true);
    expect(loadPage('/en/').querySelector('[data-lang-hint]')).toBeNull();
  });
});

describe('showcase without JavaScript', () => {
  for (const path of ['/', '/en/']) {
    it(`${path}: first chat visible, others hidden, rows match chats`, () => {
      const doc = loadPage(path);
      const chats = [...doc.querySelectorAll('[data-showcase] [data-chat]')];
      const rows = [...doc.querySelectorAll('[data-showcase] .rows button[data-select]')];
      const dots = [...doc.querySelectorAll('[data-showcase] .dots button[data-select]')];
      expect(chats.length).toBeGreaterThanOrEqual(1);
      expect(rows).toHaveLength(chats.length);
      expect(dots).toHaveLength(chats.length);
      expect(chats[0].hasAttribute('hidden')).toBe(false);
      for (const c of chats.slice(1)) expect(c.hasAttribute('hidden')).toBe(true);
      expect(rows[0].getAttribute('aria-pressed')).toBe('true');
      for (const r of rows.slice(1)) expect(r.getAttribute('aria-pressed')).toBe('false');
      expect(doc.querySelector('[data-counter]')!.textContent!.replace(/\s+/g, ' ').trim()).toBe(`1 / ${chats.length}`);
    });
  }

  it('hides dots until scripts mark the showcase ready', () => {
    expect(readAllCss()).toMatch(/\[data-showcase\]:not\(\[data-ready\]\)[^{]*\.dots[^{]*\{[^}]*display:\s*none/);
  });
});

describe('css fallbacks', () => {
  it('has a backdrop-filter fallback and reduced-motion rule', () => {
    const css = readAllCss();
    expect(css).toMatch(/@supports/);
    expect(css).toMatch(/backdrop-filter/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/color-scheme:\s*dark/);
  });
});
