// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { copyText, initCopy } from '../../src/scripts/copy';

describe('copyText', () => {
  it('returns true when the clipboard accepts', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyText('yuan@smallyuan.dev', { writeText })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('yuan@smallyuan.dev');
  });
  it('returns false when the clipboard rejects', async () => {
    await expect(copyText('x', { writeText: vi.fn().mockRejectedValue(new Error('denied')) })).resolves.toBe(false);
  });
  it('returns false when there is no clipboard', async () => {
    await expect(copyText('x', undefined)).resolves.toBe(false);
  });
});

describe('initCopy', () => {
  function setup() {
    document.body.innerHTML = '<span data-email>yuan@smallyuan.dev</span><button data-copy>複製</button>';
    return {
      button: document.querySelector<HTMLButtonElement>('[data-copy]')!,
      target: document.querySelector<HTMLElement>('[data-email]')!,
    };
  }

  it('shows the done label on success', async () => {
    const { button, target } = setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });
    initCopy(button, target, { done: '已複製', manual: '已選取，請手動複製' });
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe('已複製'));
  });

  it('selects the email and says so when the clipboard is refused', async () => {
    const { button, target } = setup();
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    initCopy(button, target, { done: '已複製', manual: '已選取，請手動複製' });
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe('已選取，請手動複製'));
    expect(window.getSelection()!.toString()).toBe('yuan@smallyuan.dev');
  });
});
