// Renders the social share images (public/og/{zh,en}.png) from the site strings.
// Run after changing the headline: `npm run og`. Needs a local Chrome/Chromium; set CHROME to its binary if not found.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { LANGS, strings, type Lang } from '../src/i18n/strings.ts';

const OUT = new URL('../public/og/', import.meta.url).pathname;

function findChrome(): string {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
  const pw = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(pw)) {
    for (const dir of readdirSync(pw).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
      candidates.push(join(pw, dir, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'));
      candidates.push(join(pw, dir, 'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'));
    }
  }
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error('No Chrome found; set CHROME=/path/to/chrome');
  return found;
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

// Chinese has no spaces to wrap at, so break after the first comma instead of mid-word
const lineBreak = (lang: Lang, s: string) => (lang === 'zh' ? s.replace('，', '，<br>') : s);

function page(lang: Lang): string {
  const t = strings[lang];
  const display = lang === 'en' ? "'Inter Tight', " : '';
  return `<!doctype html>
<html lang="${t.htmlLang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Inter+Tight:wght@600;700&display=block">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #0d1018; color: #f2f4f8;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang TC', sans-serif; -webkit-font-smoothing: antialiased; }
  .blob { position: absolute; border-radius: 50%; filter: blur(80px); }
  .b1 { width: 640px; height: 640px; left: -200px; top: -260px; background: radial-gradient(circle, #2f6bff, transparent 65%); opacity: 0.75; }
  .b2 { width: 560px; height: 560px; right: -180px; top: 120px; background: radial-gradient(circle, #ff8a3d, transparent 65%); opacity: 0.45; }
  .b3 { width: 680px; height: 680px; left: 380px; bottom: -420px; background: radial-gradient(circle, #8b5cf6, transparent 65%); opacity: 0.55; }
  main { position: absolute; inset: 0; padding: 72px 84px; display: flex; flex-direction: column; }
  .role { margin: 0; font: 500 26px 'IBM Plex Mono', ui-monospace, monospace; color: #a3abbd; }
  h1 { margin: auto 0; ${lang === 'en' ? 'max-width: 20ch;' : ''} font: 700 ${lang === 'en' ? 72 : 76}px/1.18 ${display}-apple-system, 'PingFang TC', sans-serif;
    letter-spacing: -0.015em; text-wrap: balance; }
  em { font-style: normal; background: linear-gradient(90deg, #ffd29a, #ffb454); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .site { margin: 0; display: flex; justify-content: space-between; font: 500 26px 'IBM Plex Mono', ui-monospace, monospace; color: #d6dbe6; }
</style></head>
<body>
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <main>
    <p class="role">${escape(t.role)}</p>
    <h1>${lineBreak(lang, escape(t.headline.before))}<em>${escape(t.headline.em)}</em>${escape(t.headline.after)}</h1>
    <p class="site"><span>SmallYuan</span><span>smallyuan.dev</span></p>
  </main>
</body></html>`;
}

const chrome = findChrome();
const work = mkdtempSync(join(tmpdir(), 'og-'));
mkdirSync(OUT, { recursive: true });

for (const lang of LANGS) {
  const html = join(work, `${lang}.html`);
  writeFileSync(html, page(lang));
  const out = join(OUT, `${lang}.png`);
  execFileSync(chrome, [
    '--headless',
    // Never touch the macOS keychain (it would prompt for the login password)
    '--use-mock-keychain',
    '--password-store=basic',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=5000', // let the web fonts arrive before the shot
    `--screenshot=${out}`,
    `file://${html}`,
  ], { stdio: 'ignore' });
  console.log(`wrote ${out}`);
}
