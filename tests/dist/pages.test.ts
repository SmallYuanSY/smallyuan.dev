import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadPage, readAllCss, readAllOutput } from './helpers';

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

  it('shows the English hint as a fixed overlay so revealing it never shifts the page', () => {
    expect(readAllCss()).toMatch(/\.lang-hint[^{,]*\{[^}]*position:\s*fixed/);
  });

  it('announces the English hint and keeps the page bottom reachable while it shows', () => {
    expect(loadPage('/').querySelector('[data-lang-hint]')!.getAttribute('role')).toBe('status');
    expect(readAllCss()).toMatch(/:has\(\[data-lang-hint\]:not\(\[hidden\]\)\)[^{]*\.page[^{]*\{[^}]*padding-bottom/);
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

  it('keeps the -webkit- prefixed backdrop-filter for Safari before 18', () => {
    expect(readAllCss()).toMatch(/-webkit-backdrop-filter/);
  });

  it('gives .glass a solid fill outside any @supports block', () => {
    const outside = readAllCss().replace(/@supports[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, '');
    expect(outside).toMatch(/\.glass\{[^}]*background:\s*(rgba?\(|#)/);
  });

  it('has no render-blocking stylesheet links (fonts load async, site CSS inlined)', () => {
    for (const path of ['/', '/en/']) {
      const doc = loadPage(path);
      const blocking = [...doc.querySelectorAll('link[rel="stylesheet"]')]
        .filter((l) => !l.closest('noscript'))
        .map((l) => l.getAttribute('href'));
      expect(blocking).toEqual([]);
      expect(doc.querySelector('link[rel="preload"][as="style"][href^="https://fonts.googleapis.com/"]')).not.toBeNull();
    }
  });

  it('uses system CJK fonts instead of a Noto Sans TC web font', () => {
    const doc = loadPage('/');
    const fontLinks = [...doc.querySelectorAll('link[href^="https://fonts.googleapis.com/css"]')].map((l) => l.getAttribute('href')!);
    expect(fontLinks.length).toBeGreaterThan(0);
    for (const href of fontLinks) expect(href).not.toContain('Noto+Sans+TC');
    const css = readAllCss();
    expect(css).toMatch(/--f-body:[^;]*PingFang TC[^;]*Microsoft JhengHei/);
  });

  it('never swaps web fonts in after first paint (display=optional, no layout shift)', () => {
    for (const path of ['/', '/en/']) {
      const hrefs = [...loadPage(path).querySelectorAll('link[href^="https://fonts.googleapis.com/css"]')].map((l) => l.getAttribute('href')!);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) expect(href).toContain('display=optional');
    }
  });

  it('isolates body so the z-index:-1 glow paints above its opaque background', () => {
    expect(readAllCss()).toMatch(/body\s*\{[^}]*isolation:\s*isolate/);
  });
});

describe('contact', () => {
  for (const path of ['/', '/en/']) {
    it(`${path}: shows email, copy button and GitHub link`, () => {
      const doc = loadPage(path);
      expect(doc.querySelector('[data-email]')!.textContent!.trim()).toBe('yuan@smallyuan.dev');
      const btn = doc.querySelector('button[data-copy]')!;
      expect(btn.getAttribute('data-done')).toBeTruthy();
      expect(btn.getAttribute('data-manual')).toBeTruthy();
      expect([...doc.querySelectorAll('a')].some((a) => a.getAttribute('href') === 'https://github.com/SmallYuanSY')).toBe(true);
    });

    it(`${path}: still ships its scripts (loadPage empties script bodies)`, () => {
      expect(loadPage(path).querySelectorAll('script').length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('privacy', () => {
  // The real term list stays out of git: publishing it would leak exactly what it guards.
  // See private-terms.example.txt for the format.
  const termsFile = new URL('./private-terms.local.txt', import.meta.url);
  const forbidden = existsSync(termsFile)
    ? readFileSync(termsFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    : [];
  if (forbidden.length === 0) console.warn('privacy: tests/dist/private-terms.local.txt missing or empty — private-string check skipped');

  it.skipIf(forbidden.length === 0)('contains none of the private strings', () => {
    const out = readAllOutput();
    const hits = forbidden.filter((s) => out.includes(s));
    expect(hits).toEqual([]);
  });

  it('links nowhere that does not exist yet', () => {
    for (const path of ['/', '/en/']) {
      const hrefs = [...loadPage(path).querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
      for (const h of hrefs) {
        expect(h === '/' || h === '/en/' || h.startsWith('https://')).toBe(true);
      }
    }
  });
});
