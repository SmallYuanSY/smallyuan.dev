export type Lang = 'zh' | 'en';

export const LANGS: readonly Lang[] = ['zh', 'en'];

export function pathFor(lang: Lang): string {
  return lang === 'zh' ? '/' : '/en/';
}

export const EMAIL = 'yuan@smallyuan.dev';
export const GITHUB_URL = 'https://github.com/SmallYuanSY';

export interface Strings {
  htmlLang: string;
  ogLocale: string;
  title: string;
  description: string;
  role: string;
  headline: { before: string; em: string; after: string };
  how: string;
  chatLabel: string;
  listLabel: string;
  projectChip: string;
  selectExample: string;
  linksLabel: string;
  copy: string;
  copied: string;
  copyManual: string;
  langHint: string;
  langHintGo: string;
  langHintDismiss: string;
  langGroupLabel: string;
}

export const strings: Record<Lang, Strings> = {
  zh: {
    htmlLang: 'zh-Hant',
    ogLocale: 'zh_TW',
    title: 'SmallYuan',
    description: '我把生活裡的麻煩事，一件一件做成好玩的東西。全端與軟體工程師 SmallYuan 的個人主頁。',
    role: '全端與軟體工程師',
    headline: { before: '我把生活裡的麻煩事，一件一件做成', em: '好玩的東西', after: '。' },
    how: '我寫程式的方式，是跟 Claude Code、Codex 這些 agent 一起寫。想到什麼麻煩，就讓 agent 幫我把它變成一個會自己動的小系統。',
    chatLabel: '實際對話',
    listLabel: '麻煩事 → 做成的東西',
    projectChip: '作品',
    selectExample: '看第 {n} 則對話',
    linksLabel: '連結',
    copy: '複製',
    copied: '已複製',
    copyManual: '已選取，請手動複製',
    langHint: '偏好英文嗎？',
    langHintGo: 'Switch to English',
    langHintDismiss: '關閉',
    langGroupLabel: '語言',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    title: 'SmallYuan',
    description: 'I turn everyday chores into things that are fun to build. Personal homepage of SmallYuan, full-stack and software engineer.',
    role: 'Full-stack & software engineer',
    headline: { before: 'I turn everyday chores into ', em: 'things that are fun to build', after: '.' },
    how: 'I write software together with agents like Claude Code and Codex. When something in daily life gets tedious, I have an agent help me turn it into a small system that runs on its own.',
    chatLabel: 'Real conversation',
    listLabel: 'Chore → what I built',
    projectChip: 'project',
    selectExample: 'Show conversation {n}',
    linksLabel: 'Links',
    copy: 'Copy',
    copied: 'Copied',
    copyManual: 'Selected — copy it manually',
    langHint: 'Prefer English?',
    langHintGo: 'Switch to English',
    langHintDismiss: 'Dismiss',
    langGroupLabel: 'Language',
  },
};
