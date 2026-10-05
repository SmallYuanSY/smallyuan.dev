export type Lang = 'zh' | 'en';

export function pathFor(lang: Lang): string {
  return lang === 'zh' ? '/' : '/en/';
}

export const strings = {
  zh: { htmlLang: 'zh-Hant', ogLocale: 'zh_TW', title: 'SmallYuan', description: '全端與軟體工程師 SmallYuan 的個人主頁。' },
  en: { htmlLang: 'en', ogLocale: 'en_US', title: 'SmallYuan', description: 'Personal homepage of SmallYuan, full-stack and software engineer.' },
} as const;
