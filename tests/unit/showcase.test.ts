// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { initShowcase } from '../../src/scripts/showcase';

function render(n: number): HTMLElement {
  const chats = Array.from({ length: n }, (_, i) => `<div data-chat="${i}" ${i ? 'hidden' : ''}>chat ${i}</div>`).join('');
  const dots = Array.from({ length: n }, (_, i) => `<button data-select="${i}" aria-pressed="${i === 0}"></button>`).join('');
  const rows = Array.from({ length: n }, (_, i) => `<li><button data-select="${i}" aria-pressed="${i === 0}">row ${i}</button></li>`).join('');
  document.body.innerHTML = `<section data-showcase><span data-counter>1 / ${n}</span>${chats}<div class="dots">${dots}</div><ul class="rows">${rows}</ul></section>`;
  return document.querySelector<HTMLElement>('[data-showcase]')!;
}

const visible = () => [...document.querySelectorAll<HTMLElement>('[data-chat]')].filter((c) => !c.hidden).map((c) => c.dataset.chat);
const pressed = () => [...document.querySelectorAll<HTMLElement>('[data-select][aria-pressed="true"]')].map((b) => b.dataset.select);

describe('initShowcase', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('marks the root ready', () => {
    const root = render(3);
    initShowcase(root);
    expect(root.hasAttribute('data-ready')).toBe(true);
  });

  it('switches chat, pressed state and counter when a row is clicked', () => {
    const root = render(3);
    initShowcase(root);
    root.querySelector<HTMLButtonElement>('.rows [data-select="2"]')!.click();
    expect(visible()).toEqual(['2']);
    expect(pressed()).toEqual(['2', '2']);
    expect(root.querySelector('[data-counter]')!.textContent).toBe('3 / 3');
  });

  it('switches when a dot is clicked', () => {
    const root = render(3);
    initShowcase(root);
    root.querySelector<HTMLButtonElement>('.dots [data-select="1"]')!.click();
    expect(visible()).toEqual(['1']);
  });

  it('ignores selectors with out-of-range or invalid indexes', () => {
    const root = render(2);
    root.querySelector('.rows')!.insertAdjacentHTML('beforeend', '<li><button data-select="7">bad</button><button data-select="x">bad</button></li>');
    initShowcase(root);
    root.querySelector<HTMLButtonElement>('[data-select="7"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-select="x"]')!.click();
    expect(visible()).toEqual(['0']);
  });

  it('does nothing when there are no chats', () => {
    document.body.innerHTML = '<section data-showcase></section>';
    const root = document.querySelector<HTMLElement>('[data-showcase]')!;
    expect(() => initShowcase(root)).not.toThrow();
    expect(root.hasAttribute('data-ready')).toBe(false);
  });

  it('uses real buttons so Enter and Space work natively', () => {
    const root = render(2);
    initShowcase(root);
    for (const el of root.querySelectorAll('[data-select]')) expect(el.tagName).toBe('BUTTON');
  });
});
