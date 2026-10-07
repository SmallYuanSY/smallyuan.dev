// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    document.body.innerHTML =
      '<span data-email>yuan@smallyuan.dev</span><button data-copy>複製</button><span data-copy-status role="status"></span>';
    return {
      button: document.querySelector<HTMLButtonElement>('[data-copy]')!,
      target: document.querySelector<HTMLElement>('[data-email]')!,
      status: document.querySelector<HTMLElement>('[data-copy-status]')!,
    };
  }
  const labels = { done: '已複製', manual: '已選取，請手動複製' };
  const clipboardOk = () =>
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } });

  afterEach(() => vi.useRealTimers());

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

  it('announces the result in the status region', async () => {
    const { button, target, status } = setup();
    clipboardOk();
    initCopy(button, target, labels, status);
    button.click();
    await vi.waitFor(() => expect(status.textContent).toBe('已複製'));
  });

  it('restores the original label after a moment', async () => {
    vi.useFakeTimers();
    const { button, target, status } = setup();
    clipboardOk();
    initCopy(button, target, labels, status);
    button.click();
    await vi.waitFor(() => expect(button.textContent).toBe('已複製'));
    vi.advanceTimersByTime(2000);
    expect(button.textContent).toBe('複製');
    expect(status.textContent).toBe('');
  });

  it('restarts the reset timer on a repeat click', async () => {
    vi.useFakeTimers();
    const { button, target } = setup();
    clipboardOk();
    initCopy(button, target, labels);
    button.click();
    await vi.advanceTimersByTimeAsync(1500);
    button.click();
    await vi.advanceTimersByTimeAsync(1500);
    expect(button.textContent).toBe('已複製');
    await vi.advanceTimersByTimeAsync(500);
    expect(button.textContent).toBe('複製');
  });
});
