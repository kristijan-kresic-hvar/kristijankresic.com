# PRD: wording pass

Owner's brief (2026-11-24): improve the wording and text of the site. "Dont just rewrite everything, rewrite things that sound odd." Then: "finish wording changes until its perfect."

The site's text is already tight and its facts are verified. This pass is an edit, and a light one: find every line a careful reader would stumble on, fix that line, and leave the rest alone.

## Readers

A recruiter or HR screener skims for role, stack and results and needs plain English. An engineering lead then reads one case study closely and looks for judgement. Both read on a phone as often as on a desktop.

## Scope

Every string a visitor can read or hear, on `/`, `/about/`, all ten case studies, `/thanks/`, `/not-sent/` and the 404 page:

- `src/content/work.ts` and `src/content/profile.ts`: taglines, rail captions (`short`), summaries, highlights, outcomes, marker titles and texts, credits, image alt text.
- Page and component text: headings, paragraphs, labels, buttons, helper lines, form errors and confirmations, link text, `aria-label`s, screen-reader-only text.
- Metadata: page titles, descriptions, Open Graph text.

Out of scope: the two CV PDFs, the share image, README and docs, code comments, layout and CSS, any new section or new claim, and adding technical depth to a case study (the owner has to supply that).

## Fixed constraints

- K1. Facts are frozen. Every number, name, date, technology, role and claim present at the start commit is still present and means the same. Nothing is added that the start commit does not already state somewhere on the site.
- K2. Change only what is odd. Every changed string maps to one of the defects O1 to O7 below. A line that is merely plainer or stronger in someone's taste is not a reason. Each change is logged in `.gauntlet/wording/log.md` as: where, before, after, which defect.
- K3. The hero statement stays as it is ("Frontend engineer. Six client products, built inside the client's team."). The owner signed it off; anything odd in it is reported, not changed.
- K4. Layout holds. `.gauntlet/wording/run.sh` prints `WORDING SWEEP OK`: no sideways scroll at 320, 390, 820, 1280, 1440 or 2560px, and no text block two or more lines taller than with the old wording. No CSS, class or markup change is made to fit new text; the text is made to fit.
- K5. Voice stays: first person, plain, restrained, specific. British spelling, as the site already uses ("optimisation", "serialised"). No sales language.
- K6. `npm run check` stays green. Tests that quote a changed string are updated to the new string, never loosened.
- K7. The contact form never sends in tests.

## Acceptance criteria

A failure names the criterion and quotes the line. A preference with no defect behind it is a note, not a failure.

- O1. Correctness. No spelling, grammar or punctuation error, no missing or doubled word, no wrong hyphenation of a compound ("zero-downtime changes" before a noun, "end to end" after a verb).
- O2. One reading. No sentence has to be read twice: no pronoun without a clear referent, no garden path, no modifier attached to the wrong word, no list whose items a reader cannot tell apart from the clause before it.
- O3. No stock phrases. No cliché or filler ("just works", "seamless", "robust", "leverage", "passionate", "cutting-edge"), no em dashes, and none of the staged constructions the `humanizer` skill lists (empty "not X but Y", one-line closers, forced triads, inflated significance).
- O4. Consistency across the site.
  - One spelling variant (British) and one spelling per product name, matching the product's own: Next.js, React Native, TypeScript, TanStack Query, React Hook Form, Zod, Recharts, PayPal, WordPress, Sanity, JSON-LD, Vue.js, Laravel, PostgreSQL.
  - One term per thing wherever both would be seen by the same reader (for example "pull requests" and "PRs", "sign in" and "auth", "e-signature").
  - The same fact is stated the same way wherever it appears: years of experience, the number of client teams, availability and working arrangement, the reply promise ("the same day" in the footer and "usually the same day" in the confirmation disagree; the more cautious wording wins).
  - Numbers, ranges and dates follow one format ("100k+", "4+", "Jan 2023 – Aug 2026").
- O5. Interface text. Every label, button, link, error, status and confirmation says in plain words what it is or what to do next. Errors name the problem and the fix. Link text makes sense read on its own. Icon-only controls have a label. Alt text describes what the picture shows. Screen-reader-only text reads as naturally as the visible text.
- O6. Plain English first. On every case study a non-technical reader can tell from the title and tagline what the product is and what was done. An abbreviation that is not common knowledge is spelled out at its first visible use on a page (for example BLE).
- O7. Metadata. Every page has its own title and description. Descriptions are complete sentences of 50 to 160 characters that agree with the page.

## How to check

`npm run check` for types, lint, tests and build. `.gauntlet/wording/run.sh` for K4 (about four minutes; needs the dev server on http://localhost:3000). K1 and K2 are checked by reading the diff of the range against `.gauntlet/wording/log.md`. O1 to O7 are checked by reading the rendered pages, on a phone-sized and a desktop-sized window.
