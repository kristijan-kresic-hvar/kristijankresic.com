# kristijankresic.com

Portfolio of **Kristijan Krešić**, frontend engineer — React / Next.js / TypeScript. Live at [kristijankresic.com](https://kristijankresic.com).

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · Vitest + Testing Library · GitHub Actions. Static export served from a plain VPS: no server runtime, client state is one copy button, a clock and the annotated screenshot.

## Run

```bash
npm ci
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + test + build
```

## Structure

```
src/
├── app/             # routes: / , /work/[slug], /about, 404
├── components/      # nav, footer, facts, work-card (wall tile), work-strip (index row), annotated-shot, contact-close, name-mark
├── content/         # work.ts (case studies), profile.ts (contact + stack) — the only files to edit for content
└── test/            # vitest setup
public/
├── images/work/     # pre-sized WebP per study: .webp (1600w), -card (800w), -full (page capture), -wall (640w crop), -screen-N and -screen-N-thumb
└── cv/              # the two CV PDFs; /cv/ redirects to the frontend one
```

## Conventions

- Content lives in typed TypeScript (`src/content`), not MDX: eight case studies don't justify a content pipeline.
- Images are pre-sized WebP committed to the repo; `next/image` runs unoptimized because the export is static.
- Every claim on the site is also on the CV and LinkedIn, word for word where it matters. `work.test.ts` fails on superlatives.
- Dark-only, one amber accent, Geist. Tokens in `src/app/globals.css` `@theme`.
- Conventional Commits; PR → CI (typecheck, lint, test, build) → squash-merge.

## Deploy

Push to `main` deploys via `.github/workflows/deploy.yml` once the `DEPLOY_ENABLED` repo variable is `true` and the `DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_KEY` / `DEPLOY_PATH` secrets exist. From a laptop: `DEPLOY_TARGET=user@host:/var/www/kristijankresic.com npm run deploy`.

nginx serves the `out/` folder as static files; `trailingSlash: true` means every route is a directory with an `index.html`.
