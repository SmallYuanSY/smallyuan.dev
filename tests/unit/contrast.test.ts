import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');

type Rgba = [number, number, number, number];

function token(name: string): Rgba {
  const v = css.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim();
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1) as Rgba;
  const [r, g, b, a = 1] = v.match(/[\d.]+/g)!.map(Number);
  return [r, g, b, a];
}

const over = ([r, g, b, a]: Rgba, [R, G, B]: Rgba): Rgba => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];

function luminance([r, g, b]: Rgba): number {
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ratio = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('contrast', () => {
  it('keeps "me" bubble text at WCAG AA on the lightest part of a glass card', () => {
    // Glass cards lighten the page by up to 13% white (tokens.css .glass gradient).
    const card = over([255, 255, 255, 0.13], token('ink'));
    const bubble = over(token('me'), card);
    expect(ratio(token('fg'), bubble)).toBeGreaterThanOrEqual(4.5);
  });
});
