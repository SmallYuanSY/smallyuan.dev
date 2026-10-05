import { z } from 'astro/zod';

const nonEmpty = z.string().trim().min(1);
const text = z.object({ zh: nonEmpty, en: nonEmpty });

const speech = z.object({ who: z.enum(['me', 'agent']), zh: nonEmpty, en: nonEmpty });
const tool = z.object({
  who: z.literal('tool'),
  items: z.object({ zh: z.array(nonEmpty).min(1), en: z.array(nonEmpty).min(1) }),
});

export const choreSchema = z.object({
  order: z.number().int().min(0),
  skill: z.string().regex(/^[a-z0-9-]+$/).optional(),
  link: z.url().optional(),
  from: text,
  to: text,
  chat: z.array(z.union([speech, tool])).min(2).max(4),
});

export type ChoreData = z.infer<typeof choreSchema>;
