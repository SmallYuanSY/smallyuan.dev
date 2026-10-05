import { describe, expect, it } from 'vitest';
import { EMAIL, GITHUB_URL, LANGS, pathFor, strings } from '../../src/i18n/strings';

describe('strings', () => {
  it('has the same keys in zh and en', () => {
    expect(Object.keys(strings.en).sort()).toEqual(Object.keys(strings.zh).sort());
  });

  it('has no empty copy', () => {
    for (const lang of LANGS) {
      const flat = JSON.stringify(strings[lang]);
      expect(flat).not.toMatch(/""/);
    }
  });

  it('uses the agreed headline', () => {
    const h = strings.zh.headline;
    expect(h.before + h.em + h.after).toBe('我把生活裡的麻煩事，一件一件做成好玩的東西。');
    expect(h.em).toBe('好玩的東西');
    const e = strings.en.headline;
    expect(e.before + e.em + e.after).toBe('I turn everyday chores into things that are fun to build.');
  });

  it('keeps the {n} slot in selectExample', () => {
    for (const lang of LANGS) expect(strings[lang].selectExample).toContain('{n}');
  });

  it('exposes paths and contacts', () => {
    expect(pathFor('zh')).toBe('/');
    expect(pathFor('en')).toBe('/en/');
    expect(EMAIL).toBe('yuan@smallyuan.dev');
    expect(GITHUB_URL).toBe('https://github.com/SmallYuanSY');
  });
});
