# PRD: design pass 2

Owner: Kristijan Krešić. Written 2026-11-12 from his review of the first pass (PR #1) and his answers in two question rounds. This file is the source of truth for the gauntlet loop.

## Why this exists

Verdict on the first pass, in his words: "everything seems out of place and wrong dimensions, poor images, i am not a fan of image scrolling on hover, there are no wow effects nor any motions", "this is all still a boring slop", "we need to make overall page more unique". On three alternative heroes: "none of them are really wow", the third (Stage) "is good but mobile version repeats itself since next section is work section and we list all projects and take so much space".

What he then chose:

- **Hero base:** Stage. One project plate fills most of the screen, an index beside it switches between the six featured projects.
- **Effects, all four:** a cinematic opening, a living background, images with depth, type that reacts to the pointer.
- **Intensity:** "Confident": clearly animated and reactive, but the content still leads; one or two strong effects done very well rather than many. The plate and the opening are the two leads. The background and the reactive type are support and must stay quieter.
- **Also wanted:** page transitions into case studies; pointer-reactive behaviour.
- **Images:** from the Figma design exports, cropped properly; the mobile project (Suello) shown as phone screens.
- **Layout:** one planned grid, consistent image sizes, a shorter page. Projects are listed once.
- **Not wanted:** screenshots that scroll on hover; scroll choreography; WebGL or 3D libraries; taking over the scroll wheel.

## Fixed constraints

- Tokens are locked: dark only, the colours in `src/app/globals.css` `@theme`, amber `#F59E0B` as the single accent, Geist and Geist Mono. No new colours, no new fonts.
- Content facts in `src/content/work.ts` and `src/content/profile.ts` are verified. Wording may be tightened, facts may not change.
- Next.js 16 App Router, React 19, Tailwind 4, TypeScript strict with `noUncheckedIndexedAccess`, static export (`output: 'export'`, images unoptimized).
- Progressive enhancement: every page is complete and readable with JavaScript off.
- Every animation and pointer effect is off under `prefers-reduced-motion: reduce`, leaving the final state.
- Native scrolling only.
- Keep: the annotated screenshot on case-study pages (`src/components/annotated-shot.tsx`), the shared contact close, the wordmark footer.
- Check command: `npm run check`. New logic gets a test.
- Performance tuning is out of scope until the owner approves the look. Do not chase Lighthouse. Do keep the console free of errors.
- New runtime dependencies need a one-line justification in the task report. The `motion` package is pre-approved if it earns its bytes; three.js, react-three-fiber, GSAP and scroll libraries are not allowed.

## Phases

1. **Phase 1 (this run): lint gate and hero.** Ends with a stop for the owner's review.
2. **Phase 2 (later, not planned yet):** sections below the hero, case-study page and About, after the owner picks from variants.

## Phase 1 acceptance criteria

Check each on the running site (`npm run dev`, or the export served from `out/`), in Chromium, unless stated otherwise.

### Lint gate

- **L1.** `npm run check` exists, passes, and includes typecheck, lint, unit tests and the production build.
- **L2.** ESLint runs `eslint-plugin-slop` (as set up by the `project-checks` skill) with no errors on the repo.

### Hero: structure

- **H1.** At 1440×900 and 1280×800 the first viewport shows, without scrolling: the statement ("Frontend engineer. Six client products, built inside the client's team."), an index of the six featured projects, the stage plate, and the fact sheet (status, stack, base with local time, both CV PDF links, email, GitHub, LinkedIn).
- **H2.** At 375×812 the statement and the whole fact sheet are visible without scrolling.
- **H3.** The six featured projects are listed once on the landing page. No second list, grid or strip of the same six projects appears further down, at any width.
- **H4.** On phones each featured project appears once, with its plate, its name and a link to its case study.
- **H5.** No horizontal overflow at 375, 768, 1024, 1280, 1440 or 1920. No text overlaps other text or an image at any of them. The statement takes at most four lines at each width.
- **H6.** Hero images come only from `public/images/work/<slug>-plate.webp` and `-plate-sm.webp`. None is displayed larger than its natural pixel size at device pixel ratio 1. Suello is shown as phone screens in phone proportions.
- **H7.** Nothing on the landing page scrolls an image inside its frame on hover.

### Hero: the two lead effects

- **H8. Opening.** On the first visit to `/` in a browser session a sequence plays: the statement sets itself word by word at once, and when the six plate images are loaded a small tile in the centre counts down through them (06 to 01), then grows into the stage. The plate sequence takes 1.6 seconds and always runs at full speed. If the images are not loaded within 1 second, the count is skipped and the rest of the hero rises in over 0.8 seconds. (Revised after owner review: the original 2-second cap from navigation played the count on an empty tile, at up to 60% speed, on any first visit that was not on a fast connection.)
- **H9.** The opening plays once per session. Navigating to a case study and back to `/` does not replay it.
- **H10.** Any click, key press or scroll during the opening jumps it to its end state at once. Nothing is ever blocked while it plays.
- **H11.** With JavaScript off, and separately with reduced motion on, the hero renders directly in its final state with all content visible.
- **H12. Plate depth.** With a mouse, the stage plate tilts in 3D toward the pointer (visible, at most about 6 degrees) and a soft band of light moves across its surface with the pointer. It returns to rest when the pointer leaves.
- **H13.** Choosing another project from the index (hover, keyboard focus, or tap) changes the plate with a soft dissolve: the new image is revealed over the previous one, which stays whole underneath, and it completes within 700ms. (Revised after owner review: the original flip was "too in your face and fast".)
- **H14.** Hovering quickly up and down the whole index never leaves the stage blank and always ends on the plate of the last item hovered.

### Hero: the two support effects

- **H15. Living background.** A generative field in amber on the near-black ground sits behind the hero content, drawn on a canvas. It moves slowly at rest and leans gently around the pointer, trailing it. (Revised after owner review: rings and a glow that tracked the pointer were "too reactive and in your face".)
- **H16.** The field stops animating when the hero is scrolled out of view and when the tab is hidden.
- **H17.** The field never reduces text legibility: all hero text still meets WCAG AA contrast against what is behind it, and amber covers no more than about 5 percent of the viewport.
- **H18. Reactive type.** The statement is set in variable Geist and its letters gain weight toward the pointer within a radius, easing back as it leaves. Line breaks and the position of everything else do not shift while this happens.
- **H19.** The reactive type and the field are both inactive on touch-only devices and under reduced motion.

### Hero: intensity and access

- **H20.** After the opening, with the pointer still, the only thing moving is the background field. No text, button or image loops or pulses.
- **H21.** Keyboard: every index item is reachable with Tab, focusing one switches the stage, Enter opens its case study, and the focus ring is visible. The stage link has an accessible name.
- **H22.** Screenshot judgement at 1440×900 and 375×812: the hero uses one grid with consistent edges, and shows none of these: gradient glow blobs, glass cards, a mono uppercase label above a heading, a centred headline over a row of equal cards, emoji or Unicode glyphs used as icons.

### Page transition

- **H23.** In Chromium, clicking the stage or an index item navigates to that case study with the plate visibly moving and resizing into the case-study lead image position (View Transitions). Where the API is missing the navigation is a normal one. Under reduced motion there is no morph.

### Housekeeping

- **K1.** `npm run check` is green at the end of every task.
- **K2.** New logic has tests: at minimum the once-per-session rule for the opening and any pure geometry or easing helpers.
- **K3.** No dead code from the first pass remains in files this phase touches.

## Phase 2 acceptance criteria: landing below the hero (M2)

The owner picked one of three variants for each section in the browser (2026-11-12/13). The picks are in the code as previews; this milestone makes them finished work. Motion taste for everything here: quiet. The owner cut every effect in the hero that was loud, fast or tracked the pointer tightly.

### Structure

- **S1.** Below the hero the landing has exactly three parts, in this order: how I work, earlier work, the ending. The nav's Work link lands on the hero's project index.
- **S2.** Nothing below the hero repeats the hero's fact row: no stack list, and the CV links appear once more only, in the ending. Nothing below the hero is set larger than `--text-title`.
- **S3.** At 375, 768, 1024, 1280, 1440 and 1920 there is no horizontal scroll, no clipped or overlapping text, and the three parts share their left edges with the hero's grid (page gutter, and the fourth grid column where a part is offset).

### How I work

- **S4.** One paragraph: four claims in the bright tone, each followed by its evidence in the muted tone, with a link to About and the one-line list of sectors under it. The copy says only what `src/content/profile.ts` and the previous four points said.
- **S5.** From 1024 up the portrait sits in the first columns and the paragraph starts on the fourth; the portrait's top lines up with the top of the paragraph's first line (within 4px). Below 1024 the portrait sits above the paragraph at no more than 160px wide.
- **S6.** The paragraph's lines hold between about 28 and 62 characters at every width, and its size steps down smoothly from 1920 to 375 without a jump.
- **S7.** One quiet authored moment: as the paragraph scrolls into view its sentences come up from a dimmer tone to their final two tones. CSS scroll-driven only, no layout shift, text readable (AA) at every point of it. Where scroll timelines are missing, or under reduced motion, the paragraph is simply in its final state.

### Earlier work

- **S8.** Three columns side by side from 1024, stacked below that, each with its dates first (mono, tabular), then title, then one line. At 1440 the whole section is no taller than 360px.
- **S9.** Each column is one link to its case study with a visible focus ring. The amber tick on its top hairline runs the full width while the column is hovered or focused, in 500ms or less, and does not animate under reduced motion.

### The ending

- **S10.** Contact and footer are one `footer`: the closing sentence ends in the email address, which stays on one line without overflowing at every width from 320 to 1920. Copy, phone and both CVs sit under it once; one bar carries the copyright, location, local time, GitHub and LinkedIn and wraps cleanly on phones.
- **S11.** The contour field runs behind the ending exactly as in the hero: it drifts, leans around the pointer, is dimmed behind the text, is still on touch devices and under reduced motion, and stops when the ending is off screen or the tab is hidden. All text over it meets AA.

### Housekeeping

- **S12.** With JavaScript off the three parts are complete. Keyboard order follows reading order. The console is free of errors on `/`, `/about/` and one case-study page.
- **S13.** New or changed components have tests that assert behaviour (links, labels, structure), not constants. `npm run check` passes.
