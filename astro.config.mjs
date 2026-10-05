import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://smallyuan.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
