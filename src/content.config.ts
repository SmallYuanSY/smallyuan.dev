import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { choreSchema } from './lib/chore-schema';

export const collections = {
  chores: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/chores' }),
    schema: choreSchema,
  }),
};
