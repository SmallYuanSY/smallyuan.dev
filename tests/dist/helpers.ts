import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { Window } from 'happy-dom';

const DIST = new URL('../../dist/', import.meta.url).pathname;

export function loadPage(path: string): Document {
  const file = join(DIST, path.replace(/^\//, ''), 'index.html');
  // happy-dom 20.14.5's DOMParser breaks on `<` followed by a non-space inside <script>
  // (minified inline scripts contain e.g. `n<t.length`), dropping all DOM after it:
  // '<script>var a=1<2</script><p id=x>ok</p>' → #x not found. Browsers treat script as raw text.
  // Empty script bodies (keeping the tags) before parsing; remove once happy-dom fixes this.
  const html = readFileSync(file, 'utf8').replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, '$1$2');
  const window = new Window();
  return new window.DOMParser().parseFromString(html, 'text/html') as unknown as Document;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

export function readAllOutput(): string {
  return walk(DIST)
    .filter((p) => /\.(html|css|js|svg|xml|txt)$/.test(p))
    .map((p) => readFileSync(p, 'utf8'))
    .join('\n');
}

export function readAllCss(): string {
  const css = walk(DIST).filter((p) => p.endsWith('.css')).map((p) => readFileSync(p, 'utf8'));
  const inline = walk(DIST)
    .filter((p) => p.endsWith('.html'))
    .flatMap((p) => [...readFileSync(p, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]));
  return [...css, ...inline].join('\n');
}
