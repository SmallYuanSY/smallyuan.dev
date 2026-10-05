import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://smallyuan.dev',
  trailingSlash: 'always',
  // Inline the (small) site CSS so first paint doesn't wait on another request.
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Without targets the CSS minifier drops -webkit-backdrop-filter, which Safari < 18 needs.
  vite: { build: { cssTarget: ['safari16', 'ios16', 'chrome107', 'firefox104'] } },
});
