export async function copyText(text: string, clipboard: { writeText(t: string): Promise<void> } | undefined): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function initCopy(button: HTMLButtonElement, target: HTMLElement, labels: { done: string; manual: string }): void {
  button.addEventListener('click', async () => {
    const ok = await copyText(target.textContent?.trim() ?? '', navigator.clipboard);
    if (ok) {
      button.textContent = labels.done;
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    button.textContent = labels.manual;
  });
}
