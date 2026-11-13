# Shape brief: landing, case study, about

Written 2026-11-10 after the reference pass (`docs/reference-pass.md`). Product truth and tokens come from `PRODUCT.md` and `DESIGN.md` in `kristijan-kresic-hvar/portfolio-v2`. Tokens are locked: dark only, amber `#F59E0B` as the single accent, Geist and Geist Mono.

Where the two sources disagree, this repo wins on facts. `PRODUCT.md` says "full-stack developer", a blog and a contact form; `src/content/profile.ts` says "Frontend engineer", and this build has neither a blog nor a form. The copy below follows `profile.ts` and `work.ts`.

## Job and audience

A recruiter or hiring manager arrives from LinkedIn or a CV link, on a laptop or a phone, with about a minute. They need four answers before deciding to scroll: what he does, whether he is available, where and when he works, and how to get the CV or reach him. A second reader, an engineer or designer on the hiring team, looks for evidence that the work is real and that he made the decisions himself.

Mode: Persuade on the landing. The case-study page is closer to Read with one interactive device.

## Outcome and proof

- Action: open a CV PDF or send an email. Both are reachable in the first viewport and from the sticky nav on every page.
- Proof on hand: six client products with real screens (hero, full-page capture and three inner screens each), three earlier projects, and three annotated decisions per featured study.
- True only here: a frontend engineer on an Adriatic island embedded in North American product teams, with the decisions behind each screen written down next to the screen.

## Direction contract

Chosen on the decision page: **Wall** for the hero, with the proof-sheet strips (the dealt lead, and the close second) as the work index.

- **THESIS.** The first screen is the work at reading size next to the facts a recruiter needs. It refuses the centred slogan over three cards, and it refuses the glass contact card.
- **OWN-WORLD.** Flat near-black ground. One left edge. Hairline rules instead of boxes; the only bordered rectangles on the site are screenshots. Type in two registers far apart: a display statement and 14 to 16px running text. Amber is solid ink on small things (status, the primary button, the active marker, one underline, two diacritics) and never a wash. Mono only where the text is data: times, dates, frame numbers.
- **STORY.** He is a frontend engineer, available now, in CET. Here are six shipped products. Here is what he decided on each. Here is the address.
- **FIRST VIEWPORT.** At 1440×900: nav with the name left and an amber "Email me" right. Left five columns hold the statement at about 56px, set low, with four ruled fact rows under it (status, base and local time, two CV PDFs, email with GitHub and LinkedIn). Right seven columns hold two columns of product screens, the second offset down by about 100px, running to the right screen edge and past the fold. The left block is `position: sticky`, so it stays while all six projects pass.
- **FORM.** Wall, seventh of seven on the ordered list. seed:f6c628e399db6711.
- **FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Raises taken from the declined challengers: frames in the work index are numbered and the lead frame is marked (darkroom proof sheet); amber is kept for the one item that is active or selected (paper automata).

Known risk, stated on the card: copy on one side and product on the other is the split hero every SaaS page ships. What separates this one is the offset columns bleeding off the right and bottom, the sticky fact block, and the absence of a headline-sub-button stack.

## Landing, section by section

| Section | Decision | Reference | Signature | Amber |
| --- | --- | --- | --- | --- |
| Nav | Name as wordmark, three links, one amber action. Hairline appears after scroll. | PRODUCT.md "wordmark-only"; Gil Huybrecht's header row | none, it is chrome | "Email me" at every scroll depth |
| Hero | Statement low-left in two tones, fact rows under it, wall on the right. Left block sticky for the height of the wall. | Linear (two-tone statement, product UI cut by the fold); MOUTHWASH (unequal plates); Brittany Chiang and Nan (sticky identity column, used here for one section only); Gil Huybrecht and Mother Design (availability and local time as plain text) | The wall itself. Hovering a tile scrolls its full-page capture inside the frame. | "Available now" |
| Work index | One ruled strip per featured client: year, name, role and stack on the left, three inner screens as numbered frames on the right. Earlier work as plain ruled rows. | Gil Huybrecht (numbered contact sheet); Locomotive and A24 (names between rules, year as data); Benji (ruled list by year) | Frame numbering, lead frame marked | Lead frame number; arrow on hover |
| How I work | A two-tone statement starting four columns in, the portrait off-axis, four ruled rows for how an engagement runs, stack as three text rows. No numbered cards, no chips. | Linear (two-tone paragraph); Nite Riot (credits table); Analogue (headline starting at the midpoint); PRODUCT.md "real headshot, intentionally treated" | The offset statement against the portrait | One short rule above the statement |
| Contact | The email address is the headline, one line at every width, with Copy, phone and both CVs under it. | basement.studio and TinyWins (address as headline); Aino (Copy email as a plain button) | The address at display scale | The rule under the address |
| Footer | Role, place and live time; links; the name set edge to edge with its two diacritics in amber. | TinyWins and Mother Design (wordmark footer); Benji (time and place as the last line); Rauno (one flat accent) | The name with amber š and ć marks | The diacritics |

Cut from the old landing: the glow, the dot-grid canvas, the ticker, the pulsing status dot, every mono eyebrow, the four numbered process cards, the chip cloud, the boxed contact card, fade-up reveals and smooth scrolling. Reasons are in the reference pass.

## Case-study page

| Part | Decision | Reference |
| --- | --- | --- |
| Header | Title at display scale on the left eight columns, tagline under it, a four-row credits table (role, client, period, live link) on the right, bottom-aligned with the title. | COLLINS (title off the label column); Nite Riot (credits table); Tailscale (metadata as a quiet side column) |
| Annotated screenshot | Kept as the page's signature and the site's. Markers are amber rings on the image, the list is ruled rows with the same ring, and a hairline leader joins each pair, turning in the gutter at its own x. Hover or focus either end lights the pair in amber. No pulsing. Below 1024px the lines go and the list sits under the image. | The existing component; darkroom proof marks from the challenger hand |
| What I built | Heading in the left four columns, summary at lead size and highlights as ruled rows in the right seven. Stack is the last row, as a sentence. | Shopify Plus (facts row under the claim); Lee Robinson (ruled list) |
| Outcome | When a study has one, it is set at title scale under a short amber rule. | Linear (second statement) |
| More screens | Three frames in a row at 16:10, top-aligned, each opening the full capture. | Gil Huybrecht (contact sheet) |
| Next project | One full-width ruled link: the next title at display scale with its screen beside it. | A24 and Locomotive (titles as navigation) |
| Close | The shared contact section, then the footer. | DESIGN.md motion rule 7 (peak-end) |

## About

| Part | Decision | Reference |
| --- | --- | --- |
| Header | A statement at display scale on the left, the portrait on the right in greyscale at about five columns, dropping below the header's baseline into the text. | Dennis Snellenberg (type against a portrait, without the marquee); PRODUCT.md headshot principle |
| Text | Four paragraphs in one reading column that starts three columns in. First paragraph at lead size. The AI-boundary sentence stays. | Paco and Emil (one column, hierarchy from weight and grey) |
| Timeline | Ruled rows: dates in tabular figures on the left, role and one line of detail on the right. | Benji and Brittany Chiang (date column) |
| Facts | The same fact sheet as the hero, so the CVs and contact are one glance away here too. | Gil Huybrecht |

## States and ranges

- Titles run from 7 characters ("Vetster") to 33 ("car-catcher.de & buildmycareer.de"). Display type must take two lines of the longest without overflow at 375.
- Annotations: three on featured studies, none on the three earlier ones (plain image, no list).
- Extra screens: three or none. Outcome line: present on one study today.
- Interactive states to design: link and button hover, focus and press; copy button idle, copied and refused; marker and list row idle and active; wall tile hover.
- No loading, error or empty states: the site is static.

## Interaction and layout

- One page frame with a fluid gutter (20px on phones to 56px), capped at 1920px. Twelve columns from 1024. Content hangs from the left edge; each section breaks the frame once.
- Phones: statement, fact rows, then the wall in two columns. Everything in the essentials list sits inside the first 812px.
- Native scroll only. Sticky positioning and CSS scroll-driven effects are allowed; scroll snapping and smooth-scroll libraries are not.
- Motion budget: hover and press answer in 100ms. One entrance on the hero. Everything else is a response to the reader. All of it sits behind `prefers-reduced-motion: no-preference`.

## Constraints and open decisions

- Static export, images pre-sized WebP. New crops are generated from files already in `public/images/work` and committed.
- Complete without JavaScript: the local time shows the zone, the annotated list shows without lines, copy falls back to selecting.
- Lighthouse 100 on mobile governs. On phones the LCP element is the statement text.
- Not decided here: whether `PRODUCT.md` and `DESIGN.md` should live in this repo. They are local, git-excluded working copies for now.
