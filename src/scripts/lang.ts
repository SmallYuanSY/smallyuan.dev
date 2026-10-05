import type { Lang } from '../i18n/strings';

export const STORAGE_KEY = 'smallyuan:lang';

export function shouldSuggestEnglish(pageLang: string, languages: readonly string[], stored: string | null): boolean {
  if (!pageLang.toLowerCase().startsWith('zh')) return false;
  if (stored === 'zh' || stored === 'en') return false;
  const primary = languages[0];
  if (!primary) return false;
  return !primary.toLowerCase().startsWith('zh');
}

export function readStored(storage: () => Storage): string | null {
  try {
    return storage().getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStored(storage: () => Storage, value: Lang): void {
  try {
    storage().setItem(STORAGE_KEY, value);
  } catch {
    // Storage blocked (private window, site data off): the choice just isn't remembered.
  }
}

export function initLang(
  doc: Document,
  nav: { languages?: readonly string[]; language?: string } = navigator,
  storage: () => Storage = () => window.localStorage,
): void {
  doc.querySelectorAll<HTMLElement>('[data-lang-choice]').forEach((el) => {
    el.addEventListener('click', () => {
      const v = el.dataset.langChoice;
      if (v === 'zh' || v === 'en') writeStored(storage, v);
    });
  });

  const hint = doc.querySelector<HTMLElement>('[data-lang-hint]');
  if (!hint) return;

  const languages = nav.languages && nav.languages.length > 0 ? nav.languages : nav.language ? [nav.language] : [];
  if (shouldSuggestEnglish(doc.documentElement.lang, languages, readStored(storage))) hint.hidden = false;

  doc.querySelector('[data-lang-dismiss]')?.addEventListener('click', () => {
    writeStored(storage, 'zh');
    hint.hidden = true;
  });
}
