# PRD: responsive pass

Owner's brief (2026-11-23): the site looks right on a desktop screen. It has to look even better on phones and tablets, with a mobile-first feel, because most visitors are on small devices. Very wide screens must be supported too. Sections may be rearranged or rethought where the small-screen version needs it. Animations that only work with a mouse are turned off or rebuilt so they work on touch. The decision points on the case-study screenshot do nothing useful on touch: tapping a number should take the visitor to its explanation.

## What the audit found (start commit 3b81795)

- Phone (390px): the page is the desktop layout stacked. A five-row facts table sits between the headline and the rest. The portrait floats beside empty space. The CV links in the ending wrap with one orphan. On a case study the annotated screenshot is about 350px wide with 24px markers, and tapping one only toggles a highlight.
- Tablet portrait (768 to 834px): the facts come before the work. "How I work", "Earlier work" and "What I built" each leave about half the screen empty. Case-study columns collapse to one narrow strip.
- Tablet landscape (touch, 1024px and up): gets the desktop stage, which picks projects on hover. Touch has no preview step.
- 2560px: content is a fixed island about 1800px wide with small type and wide dead margins.

## Device classes and test sizes

| Class | Definition | Test sizes |
| --- | --- | --- |
| Phone | width under 640px | 320x568, 360x740, 390x844, 430x932 |
| Tablet portrait | 640 to 1023px | 768x1024, 820x1180 |
| Tablet landscape | 1024px and up with a coarse pointer and no hover | 1024x768, 1180x820, 1366x1024 |
| Desktop | 1024 to 1600px with a fine pointer and hover | 1280x800, 1440x900, 1600x900 |
| Wide | over 1600px | 1920x1080, 2560x1440, 3440x1440 |

Touch classes are tested with touch emulation on (`hasTouch`, `isMobile`), which makes `(hover: none)` and `(pointer: coarse)` match.

## Fixed constraints

- K1. Desktop is frozen. The owner signed it off. `.gauntlet/guard/run.sh` compares full-page pictures of `/`, `/work/biocirv/`, `/work/buildmycareer/` and `/about/` at 1280, 1440 and 1600px against the recorded baseline and must print `DESKTOP GUARD OK`. Width-based changes therefore start below 1024px or above 1600px, and touch changes at 1024px and up are keyed on pointer and hover, not on width.
- K2. Tokens stay: dark only (#0A0A0B), one amber accent, Geist and Geist Mono. No new colours, fonts or dependencies.
- K3. Content facts in `src/content/work.ts` and `profile.ts` are verified. Wording may be shortened for a small screen; no claim is added or changed.
- K4. Motion stays quiet: slow, short distances, nothing that tracks a finger tightly. One motion idea per section.
- K5. Few dividers: rules between list items only, none framing a list.
- K6. The existing guarantees hold at every size: reduced motion means nothing moves; the page is complete with JavaScript off; forced colours and print still work; the contact form never sends in tests.
- K7. The plate transition between the hero and a case study keeps working wherever a plate is visible on both ends. React pairs only `<ViewTransition>` elements that had their name at mount.
- K8. `npm run check` stays green. New logic (selection state, scroll tracking, swipe) has unit tests.

## Acceptance criteria

### General (every page, every milestone)

- G1. No horizontal scrolling at any test size on `/`, `/about/`, all ten case studies, `/thanks/`, `/not-sent/` and the 404 page.
- G2. On touch classes every interactive element has a hit area of at least 44 by 44 CSS px: nav links and button, rail cards, index rows, markers, decision rows, slate links, lightbox controls, CV and social links, form controls, copy button. Text links inside a running paragraph are exempt but must be at least 24px tall.
- G3. Form controls use a font size of at least 16px on touch classes, so iOS does not zoom the page on focus.
- G4. On phones body copy is at least 16px and no text is under 12px.
- G5. Nothing depends on hover on touch classes: no information is revealed only on hover, and no element stays in its hover look after a tap.
- G6. Reduced motion: at every test size, after load and after each interaction, no animation or transition longer than a frame runs.
- G7. JavaScript off at 390px and 820px: every section's content is visible, links work, the form posts.

### Landing on phones (L)

- L1. First screen at 390x844 and 360x740 shows, without scrolling: the headline, a one-line availability statement ("Available now" plus where), one primary action that leads to contact, and at least the top 120px of the first project picture.
- L2. The six featured projects are a horizontal rail that swipes with scroll snap. The next card peeks by at least 24px. A position indicator names the current card out of six and updates as the rail moves. A whole card is one link to its case study. The rail is reachable and operable by keyboard, and without JavaScript it is still a scrollable row.
- L3. The facts (stack, base and local time, CVs, contact links) come after the work, in a compact form that is at most 300px tall at 390px wide. Availability is no longer buried in that block (L1). CV links are full tap targets.
- L4. "How I work": portrait and paragraph are composed for the width. At 390px and at 768 to 820px there is no empty area wider than 40% of the viewport beside the portrait. The paragraph is at least 20px on phones.
- L5. "Earlier work": on phones each project is one tappable row (whole row is the link, with a visible affordance). At tablet portrait the four sit in two columns.
- L6. Ending: the email address fits on one line at 320px without breaking mid-word. Copy email and the two CV links form an even group with no orphan. Form fields span the column, and the send button is full width and at least 48px tall on phones.
- L7. Opening on phones: the first project picture is visible within 300ms of first paint (it is not held back for the headline). The whole opening lasts at most 1.2s on phones and is skipped under reduced motion.

### Landing on tablets (L)

- L8. Tablet portrait order: headline, availability and action, work, facts, how I work, earlier work, ending. Work comes before the facts.
- L9. Tablet portrait work area uses the width: the current project's plate is at least 60% of the viewport wide, all six projects are reachable without a page scroll of more than one screen, and it is not the phone rail stretched.
- L10. Touch stage (tablet landscape, and tablet portrait if it uses an index): tapping a project name selects it. The stage shows that project and the row carries `aria-current`. A first tap on an unselected row never navigates. The selected row shows an explicit way to open the case study, and tapping the plate opens the selected project with the plate transition. Pointer tilt and pointer-follow effects are off on coarse pointers.
- L11. Phone landscape (for example 844x390): the hero is usable. Nothing is taller than the viewport in a way that hides the headline or the rail behind the nav.

### Case study on touch (C)

- C1. On touch classes each numbered marker on the lead picture has a hit area of at least 44px. Tapping marker n scrolls decision n into view below the nav (smoothly, or instantly under reduced motion), marks it current (`aria-current="true"` and a visible highlight) and moves focus to it.
- C2. On phones and tablet portrait the lead picture stays pinned under the nav while the decisions scroll past, so the marker and its explanation are on screen together. As the visitor scrolls, the decision at the reading line becomes current and its marker lights (one current at a time). The pinned picture takes at most 45% of the viewport height. Pinning is off when the viewport is under 500px tall.
- C3. Tapping decision n also marks marker n current. With the picture pinned (C2) the lit marker is visible at once.
- C4. Tapping the picture away from a marker opens it full screen in the lightbox, where it can be pinch-zoomed or panned at 2x or more.
- C5. The helper line under "The decisions behind this screen" matches the input: it does not say "hover" on touch classes.
- C6. Tablet landscape touch keeps the side-by-side layout. A tap on a marker or a decision sets the current one, and the leader line shows for the current decision, not on hover.
- C7. Slate: "All work", the position and "Next" are each at least 44px tall on touch classes and do not overlap at 320px.
- C8. Layout: on phones everything is one column. At tablet portrait the credits sit in one row of four or two rows of two, and "What I built" puts its text and its numbered highlights side by side or otherwise fills the width. No column is narrower than 28 characters, and no section leaves more than 40% of the width empty.
- C9. More screens: tapping a picture opens the lightbox. In the lightbox on touch classes: swiping left or right changes picture, the counter is visible, every control is at least 44px, close is reachable, page scroll behind is locked, and pinch zoom is not blocked.
- C10. Next project: on touch classes its arrow and light motion play once when the block scrolls into view, or it is static. The whole block is one link.
- C11. A case study without a lead picture (BuildMyCareer) and one with a single highlight (Robinson, Agrivi) hold at every test size.

### Chrome and About (A)

- A1. Nav at 320px to 430px: name, Work, About and the contact button are present, nothing overlaps or truncates, every target meets G2, and the bar is at most 60px tall. The CV is reachable from the nav or from the first screen of the landing.
- A2. About on phones: the portrait is placed deliberately (full width or a set crop with its caption), the bio is at least 17px with 30 to 42 characters per line, and the experience list stacks period above role.
- A3. About at tablet portrait: reading measure 45 to 75 characters, no empty area over 40% of the width.
- A4. `/thanks/`, `/not-sent/` and the 404 page hold at phone and tablet sizes and meet G2.
- A5. The footer bar stacks on phones with links that meet G2.

### Wide screens (W)

- W1. Above 1600px the layout scales fluidly. At 1920 and 2560px the content block is at least 78% of the viewport wide. At 3440px it is centred and at least 60% wide.
- W2. Type scales with it: at 2560px body copy is at least 20 CSS px and nav links at least 16px.
- W3. Paragraphs keep a measure of at most 75 characters at every wide size.
- W4. Pictures are not upscaled past 1.25 times their file's pixels at device pixel ratio 1.
- W5. 1600px itself is unchanged (K1).

### Performance guard (P)

- P1. On a production build at 390px, layout shift stays at zero and total blocking time under 100ms (Lighthouse mobile).
- P2. A phone still fetches no hidden stage plates, and the first rail picture is fetched at high priority.
- P3. No new JavaScript dependency. The client bundle for the landing grows by at most 4 KB compressed.

## Hover and pointer inventory (what M1 to M4 must resolve on touch)

| Where | Mouse behaviour | On touch classes |
| --- | --- | --- |
| Hero stage index | hover or focus picks a project | tap selects, explicit open (L10) |
| Hero plate | tilts toward the pointer, light band on hover | off; the plate rests flat |
| Rail thumb (phone) | none | current card marked as the rail moves (L2) |
| Earlier work cells | hover highlight | none; pressed state only |
| Markers and decisions | hover lights the pair, leader line | tap and scroll set the current pair (C1 to C6) |
| Next project | arrow travels and light band on hover | once in view, or static (C10) |
| Links and buttons | hover colour | pressed state; no stuck hover |

## Out of scope

Copy changes beyond shortening, new sections, a hamburger menu, a bottom tab bar, dark and light themes, the contact backend, and anything in the desktop class.

## How to check

`npm run check` for types, lint, tests and build. `.gauntlet/guard/run.sh` for K1. Pages are checked in a real browser with playwright-cli against the dev server on http://localhost:3000, with touch emulation for the touch classes.
