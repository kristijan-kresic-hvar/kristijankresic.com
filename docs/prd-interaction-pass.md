# PRD: interaction pass

Owner's brief (2026-11-25): "we need to be throughout when we do changes, so nothing is out of place. I noticed the points glitching depending when user scrolls image over edge of notes, we need to take care of similar issues. use gauntlet loop until everything is perfect."

"Points" are the numbered markers on a case study's lead picture. "Notes" are the numbered rows under the heading "What I built here" (called "decisions" in older code and documents).

## What is wrong today

Measured on `/work/biocirv/` at 390 by 844px with touch, stepping the scroll 2px at a time (picture pinned, its lower edge at 300px):

- Note 1 is lit for 32px of scroll. Then number 2 lights while note 1 still sits whole directly under the picture.
- Number 3 goes dark while note 3 is fully readable directly under the picture. From there nothing is lit.
- The last note has to slide all the way under the picture before the picture lets go.
- Nothing is lit until the first scroll event, and the lit pair changes at the instant a row's box touches the picture's edge, which is what reads as a glitch.

The cause is the rule in `currentAt` (`src/components/annotated-shot.tsx`): a note becomes current at a reading line 32px under the picture and hands over as soon as its row box passes the picture's edge. This PRD replaces that rule. Where it disagrees with C2 of `docs/prd-responsive-pass.md`, this PRD wins.

## Fixed constraints

- K1. Desktop is frozen. `.gauntlet/guard/run.sh` prints `DESKTOP GUARD OK` against the recorded baseline, which is not re-recorded in this pass. With a mouse at 1024px and wider nothing looks or behaves differently.
- K2. Tokens stay: dark only, one amber accent, Geist and Geist Mono. No new colours, fonts or dependencies.
- K3. No wording change that a visitor can read or hear, apart from what P9 names.
- K4. Motion stays quiet. No new animation. Under reduced motion nothing moves.
- K5. The page stays complete with JavaScript off. With scripts off the picture may behave as it does today.
- K6. `npm run check` stays green. Changed logic has unit tests. A test for a rule this PRD replaces is rewritten for the new rule, never deleted without a replacement and never loosened.
- K7. The contact form never sends in tests.
- K8. Nothing shifts as the page settles: no element moves after first paint because a script measured something.
- K9. Safari is required beside Chromium (owner, 2026-11-25: "safari is a must besides chromium"). P1 to P8 and S1 to S8 hold in Safari on macOS and in Safari on an iPhone and an iPad. No milestone passes on Chromium evidence alone. Nothing may depend on a feature Safari lacks without a fallback that meets the same criterion.

## Test sizes

Touch: 320 by 568, 390 by 844, 820 by 1180, 1180 by 820, and for Part 3 the sizes its criteria name, each with touch and with a mouse. Mouse: 900 by 800, 1280 by 800, 1440 by 900, 2560 by 1440. The seven case studies with a numbered picture: biocirv, oncallable, suello, vetster, naitur, buddyins, carcatcher.

## Part 1: the numbered picture and its notes

These apply wherever the picture can pin: narrower than 1024px and at least 500px tall.

A note's head is its number chip and its title. A head is whole when all of it is at or below the lower edge of the picture's pinned block and inside the window.

- P1. One rule. At every scroll position where any of the picture is on screen, the current note is the top-most note whose head is whole. When no note has a whole head, none is current. The current note carries `aria-current="true"` and its marker on the picture is lit; no other marker or note is lit. Never two.
- P2. The lit pair depends on where the page is, not on how it got there. The same position gives the same pair after scrolling down, scrolling up, a flick, paging with the keyboard, dragging the scrollbar, a reload that restores the scroll position, back and forward navigation, and a resize or rotation. It is right on load, before any scroll.
- P3. No flash. Stepping the scroll through the picture and its notes in either direction, every lit state lasts at least 48px of scroll, and no pair goes A, B, A.
- P4. The last note is never under the picture. The picture lets go when the last note reaches the place a tap would leave it (its head whole, within 48px of the picture's lower edge); from there the picture and the last note leave together, the last note still lit. What follows the notes stays where it is today: page heights do not change, and nothing after the notes slides under the picture.
- P5. Taps. Tapping a marker, or a note, brings that note to rest with its head whole just under the picture (within 48px of the edge), lights the pair and moves focus to the note. No other pair lights on the way. A second tap during the glide ends on the second note. Under reduced motion the move is instant. A few pixels of scroll after a tap do not change the pair.
- P6. Where the picture does not pin, nothing tracks the scroll, and a pair lit by scrolling does not stay lit when a rotation or resize takes the page out of the pinned layout. Under 500px tall, and on touch at 1024px and wider, a tap on a marker or a note lights that pair, as today.
- P7. A change of pair is one colour change at the existing durations, instant under reduced motion.
- P8. The helper line, the 44px touch targets, the lightbox on tapping the picture, and the fade under the pinned picture all work as before.
- P9. Names. Code comments, test names and identifiers in `src/components/annotated-shot.tsx`, its test and the matching rules in `src/app/globals.css` call these "notes", as the page now does.

`.gauntlet/scroll/run.sh` checks P1 to P5 by measurement and prints `SCROLL PROBE OK`. `run.sh quick` is the three-minute subset.

## Part 2: everything else that follows a scroll, a swipe or a tap

The same four faults are looked for everywhere: a state that flashes, a state that disagrees with what is on screen, a pinned thing that covers what should be readable, and a state that depends on how the visitor arrived. Each item below is measured at the test sizes it applies to, the evidence is written to `.gauntlet/scroll/audit.md` (what was done, what was seen, numbers), and every fault found is fixed. An item with no fault is recorded as checked, with the evidence.

- S1. Hero rail on phones and tablet portrait. The position indicator and caption always name the card the rail rests on. During a swipe they change once, never back and forth. After a swipe of any speed the rail rests on a card, never between two. Coming back from a case study, the rail rests on that project.
- S2. Lightbox. The counter matches the picture shown, in both directions. After fast swipes it rests on one picture. Opening at picture n shows n at once without sliding through the others. Closing returns the page to the scroll position it had, and the page behind does not move while the lightbox is open.
- S3. Pinned side heading on case studies (`.cs-side`). It never overlaps the nav, its own column's text or the section after it, and it lets go at the end of its section without a jump. Where the window cannot hold it, it is not pinned.
- S4. Arriving part-way down. After a reload that restores the scroll position, and after going back to a page, nothing that should be visible is left hidden or dimmed (scroll-in reveals, the "How I work" tone, the nav hairline), and nothing replays.
- S5. Next project block on touch. Its motion plays at most once per visit to the page and does not replay when scrolled past again.
- S6. Jumps. "Email me" in the nav, the skip link and every in-page link land with their target's heading whole below the nav at every test size, on the landing and on a case study.
- S7. After a touch scroll or a tap, nothing is left in its hover or pressed look.
- S8. Back from a case study to the landing: the page shows the place the visitor left, with no visible jump after it appears.

## Part 3: the size of the lead picture between phone and desktop

Owner (2026-11-25), looking at `/work/buddyins/` in a 768 by 572 window: "isnt it too small for tablet users ?" It is. The pinned picture is capped at 44% of the window's height, so in a window that is wide and short it shrinks and sits at the left with nothing beside it. Measured today: 50% of its column at 768 by 572, 42% at 960 by 600, 52% at 1023 by 768, 62% at 900 by 800, 74% at 785 by 834. On a phone on its side the opposite happens: at 844 by 390 the picture is 497px tall in a window with 325px under the nav, so it can never be seen whole. Tablets held upright are fine (94 to 100%).

Under 1024px wide the picture and its notes take one of three layouts, chosen by the window alone, with the same conditions in the CSS and in the script:

- Upright: under 1024px wide, at least 500px tall, and less than 6:5 wide to tall. The picture is stacked above its notes and pins (Part 1).
- Side by side: 768 to 1023px wide and at least 6:5 wide to tall, at any height. The picture sits beside its notes.
- Free: everything else under 1024px. The picture is stacked above its notes and does not pin.

- T1. The whole picture can be seen at once. At every size its height is at most the window height minus the nav minus 16px.
- T2. Upright: the picture is as wide as its column, made narrower only as far as needed to leave 200px for notes under it while it is pinned. It is at least 85% of its column at 768 by 1024, 744 by 1133, 820 by 1180, 785 by 834 and 900 by 800.
- T3. Side by side: the picture is at least 55% of the content width and its notes column is at least 250px wide. The picture stays in view under the nav while its notes scroll, and lets go at the end of the notes without covering anything. Pairs light as P6 says (a tap on touch, hover or focus with a mouse); nothing tracks the scroll. Leader lines are not required. Checked at 768 by 572, 844 by 390, 932 by 430, 900 by 600, 960 by 600, 1000 by 700 and 1023 by 768.
- T4. Free: the picture is as wide as its column unless T1 makes it narrower. Checked at 568 by 320, 667 by 375 and 700 by 520.
- T5. In a stacked layout a picture narrower than its column is centred in it.
- T6. In all three layouts the markers keep their 44px touch targets, a tap on a marker or a note behaves as Part 1 says for that layout, and P1 to P5 hold wherever the picture pins.
- T7. The step from 1023px to 1024px wide is not a jolt: at 1023 by 768 and 1024 by 768 the picture is beside its notes in both, and its width differs by no more than 15%.

Page heights under 1024px change with this part by design; `.gauntlet/scroll/heights.json` and `heights.webkit.json` are re-recorded by the orchestrator once, after T1 to T7 hold.

## Part 4: every page and section at every window shape

Owner (2026-11-25): "can we make sure layout makes sense on all screens for all pages and sections so we dont have similar problems again." The picture-size fault got through because earlier passes were tested at a handful of device sizes (320 by 568, 390 by 844, 820 by 1180, 1280 by 800 and up). Windows between those, and windows that are wide and short, were never looked at.

The sweep. A script kept in the repository under `scripts/layout/`, run with `npm run check:layout` (needs the dev server and playwright-cli, no new dependency), loads every page at every sweep size in Chromium and in WebKit, judges V1 to V5 by measurement, prints one line per finding and `LAYOUT SWEEP OK` when there is none, and writes a contact sheet of screenshots per page for V6. It takes a base address, so it can be pointed at the deployed site. Run against the code before Part 3 (the deployed preview while it still has it, or commit f3f1fc5), it must report the two known faults: the lead picture at about 50% of its column at 768 by 572, and the lead picture taller than the window at 844 by 390. A sweep that cannot see those is not accepted.

Pages: `/`, `/about/`, all ten case studies, `/thanks/`, `/not-sent/` and the 404 page.

Sweep sizes. Widths 320, 360, 390, 430, 480, 540, 600, 640, 700, 768, 820, 900, 960, 1023, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920, 2560. Each width at a short, a middle and a tall window, chosen so that both upright and sideways shapes are covered, plus phones on their side (568 by 320, 667 by 375, 844 by 390, 932 by 430). Touch under 1024px wide and at 1180 by 820 and 1366 by 1024; a mouse from 900px wide.

For every page, every section and every sweep size, in both engines:

- V1. Nothing is wider than the window and the page does not scroll sideways. A rail that is meant to scroll sideways is the only exception.
- V2. Nothing is cut off or sits on top of something else: no text box overlaps another, no text is clipped by its container, no control is under the nav or a pinned block when the page is at rest.
- V3. No picture, plate, chart or card row is left small beside empty space: each is at least 60% of its section's content width unless something sits beside it. A paragraph held to a reading measure is not a fault.
- V4. Everything meant to be seen whole can be: no picture is taller than the window minus the nav, and no pinned block is taller than the room it pins in or leaves less than 200px for what scrolls past it.
- V5. Text stays readable: body lines run between 28 and 85 characters, and no text is under 12px.
- V6. By eye, on the contact sheets: no section looks unfinished at any size. That means no lopsided empty space, no element orphaned on a row of its own, no heading parted from what it heads, no columns of badly uneven height, and no abrupt change of composition between two sizes one step apart unless the PRD names it.
- V7. Each fault found is fixed where the layout is defined (the rule that produced it), not patched at the one size that showed it.

The signed-off desktop look still holds (K1): the guard must pass. At 1024px and wider with a mouse, a V1, V2 or V4 fault is fixed provided the guard stays pixel-identical at its sizes; a V3 or V6 finding at those sizes is not changed: it is listed for the owner with a screenshot.

## How to check

`npm run check` for types, lint, tests and build. `.gauntlet/guard/run.sh` for K1. `.gauntlet/scroll/run.sh` for P1 to P5 and the page heights (about twelve minutes; `quick` about three). `npm run check:layout` for V1 to V5 and the contact sheets (Part 4). All of these need the dev server on http://localhost:3000. P6 to P8 and Part 2 are checked by driving the real pages at the test sizes.
