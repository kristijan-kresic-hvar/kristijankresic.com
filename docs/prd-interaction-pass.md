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

## Test sizes

Touch: 320 by 568, 390 by 844, 820 by 1180, 1180 by 820. Mouse: 900 by 800, 1280 by 800, 1440 by 900, 2560 by 1440. The seven case studies with a numbered picture: biocirv, oncallable, suello, vetster, naitur, buddyins, carcatcher.

## Part 1: the numbered picture and its notes

These apply wherever the picture can pin: narrower than 1024px and at least 500px tall.

A note's head is its number chip and its title. A head is whole when all of it is at or below the lower edge of the picture's pinned block and inside the window.

- P1. One rule. At every scroll position where any of the picture is on screen, the current note is the top-most note whose head is whole. When no note has a whole head, none is current. The current note carries `aria-current="true"` and its marker on the picture is lit; no other marker or note is lit. Never two.
- P2. The lit pair depends on where the page is, not on how it got there. The same position gives the same pair after scrolling down, scrolling up, a flick, paging with the keyboard, dragging the scrollbar, a reload that restores the scroll position, back and forward navigation, and a resize or rotation. It is right on load, before any scroll.
- P3. No flash. Stepping the scroll through the picture and its notes in either direction, every lit state lasts at least 48px of scroll, and no pair goes A, B, A.
- P4. The last note is never under the picture. The picture lets go when the last note's head reaches its lower edge; from there the picture and the last note leave together, the last note still lit. What follows the notes stays where it is today: page heights do not change, and nothing after the notes slides under the picture.
- P5. Taps. Tapping a marker, or a note, brings that note to rest with its head whole just under the picture (within 48px of the edge), lights the pair and moves focus to the note. No other pair lights on the way. A second tap during the glide ends on the second note. Under reduced motion the move is instant. A few pixels of scroll after a tap do not change the pair.
- P6. Where the picture does not pin, nothing tracks the scroll. Under 500px tall, and on touch at 1024px and wider, a tap on a marker or a note lights that pair, as today.
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

## How to check

`npm run check` for types, lint, tests and build. `.gauntlet/guard/run.sh` for K1. `.gauntlet/scroll/run.sh` for P1 to P5 and the page heights (about twelve minutes; `quick` about three). All three need the dev server on http://localhost:3000. P6 to P8 and Part 2 are checked by driving the real pages at the test sizes.
