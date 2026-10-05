import type { Lang } from '../i18n/strings';
import type { ChoreData } from './chore-schema';

export type ChatLine = { who: 'me' | 'agent'; text: string } | { who: 'tool'; items: string[] };

export interface ChoreView {
  id: string;
  from: string;
  to: string;
  chip: string;
  link?: string;
  chat: ChatLine[];
}

export function toChoreViews(entries: { id: string; data: ChoreData }[], lang: Lang, projectChip: string): ChoreView[] {
  return [...entries]
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id))
    .map(({ id, data }) => {
      const view: ChoreView = {
        id,
        from: data.from[lang],
        to: data.to[lang],
        chip: data.skill ?? projectChip,
        chat: data.chat.map((line): ChatLine =>
          line.who === 'tool' ? { who: 'tool', items: line.items[lang] } : { who: line.who, text: line[lang] },
        ),
      };
      if (data.link) view.link = data.link;
      return view;
    });
}
