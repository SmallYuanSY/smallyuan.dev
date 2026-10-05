export function initShowcase(root: HTMLElement): void {
  const chats = [...root.querySelectorAll<HTMLElement>('[data-chat]')];
  if (chats.length === 0) return;
  const selectors = [...root.querySelectorAll<HTMLElement>('[data-select]')];
  const counter = root.querySelector<HTMLElement>('[data-counter]');

  const select = (index: number) => {
    chats.forEach((el, i) => { el.hidden = i !== index; });
    selectors.forEach((el) => el.setAttribute('aria-pressed', String(Number(el.dataset.select) === index)));
    if (counter) counter.textContent = `${index + 1} / ${chats.length}`;
  };

  selectors.forEach((el) => {
    el.addEventListener('click', () => {
      const index = Number(el.dataset.select);
      if (Number.isInteger(index) && index >= 0 && index < chats.length) select(index);
    });
  });

  root.setAttribute('data-ready', '');
}
