# kristijankresic.com

Portfolio of **Kristijan Krešić**, frontend engineer — React / Next.js / TypeScript. Live at [kristijankresic.com](https://kristijankresic.com).

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · Vitest + Testing Library · GitHub Actions. Static export served from a CDN: no server runtime, client state is one copy button, a clock and the annotated screenshot.

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

The site runs on DigitalOcean App Platform as one app with two components, both built from this repo on every push to the deployed branch:

- a **static site**: build `npm run build`, output directory `out`, served from the CDN. `trailingSlash: true` means every route is a directory with an `index.html`.
- the **contact service** (`server/`, built from `server/Dockerfile`), routed at `/api/contact`. Setup and settings: [docs/contact-service.md](docs/contact-service.md).

Analytics: set `NEXT_PUBLIC_CF_BEACON_TOKEN` on the static site component to the token of the site in Cloudflare Web Analytics. Without it the build ships no analytics script.

The older VPS path still works if the site ever moves: `.github/workflows/deploy.yml` (off unless the `DEPLOY_ENABLED` repo variable is `true`), `npm run deploy`, and the nginx and systemd files in `deploy/`.
