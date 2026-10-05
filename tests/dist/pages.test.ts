import { describe, expect, it } from 'vitest';
import { loadPage } from './helpers';

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
