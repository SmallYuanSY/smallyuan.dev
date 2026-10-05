# smallyuan.dev

SmallYuan's personal homepage. Astro 7, deployed on Cloudflare Workers (static assets) from `main`; deploy config is in `wrangler.jsonc`.

- `npm run dev` — local dev server
- `npm run verify` — unit tests, type check, build, built-output tests
- Privacy check: list private terms in `tests/dist/private-terms.local.txt` (git-ignored; format in `private-terms.example.txt`); without it that check is skipped
- Add a showcase entry: create `src/content/chores/<slug>.md` (see existing files; the build rejects invalid entries)
- Copy lives in `src/i18n/strings.ts`
- Design: `docs/superpowers/specs/2026-10-05-homepage-design.md`
