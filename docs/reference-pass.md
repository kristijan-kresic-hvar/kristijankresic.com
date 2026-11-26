# Reference pass

Captured 2026-11-10 at 1440×900 with playwright-cli (fold plus the second viewport), with computed type metrics read from the DOM. Mobbin MCP supplied the component patterns.

Two limits on this pass:

- **land-book.com is not in here.** It returned a Cloudflare challenge to the headless browser and HTTP 403 to a plain fetch. Nothing below is attributed to it.
- **Motion notes are split by evidence.** "Measured" means I read it from the live page in this pass (running animation count, canvas/video count, scroll library class on `<html>`). "Known" means I am describing behaviour I know the site for and did not re-verify frame by frame. Static captures cannot show hover states.

firecrawl and exa were not connected in this session, so gallery browsing used the browser directly and one web search.

## Sources

### Moodboard (PRODUCT.md "Look at instead")

| Site | Above the fold | Grid and rhythm | Type behaviour | How work is shown | Signature | Motion does / never does |
| --- | --- | --- | --- | --- | --- | --- |
| [rauno.me](https://rauno.me) | One sentence as the whole hero: "Rauno Freiberg is an Estonian interaction designer working with Vercel and Devouring Details". No nav, no CTA. | A single white slide on grey, next slide peeking in from the right edge. | 85px, weight 500, every second line indented. The sentence is the layout. | Slides in a horizontal track. | A tick ruler at the top that doubles as position minimap, and one flat yellow circle overlapping the text. | Measured: 7 running animations, no canvas. One saturated shape, used once. Never a gradient or a glow. |
| [paco.me](https://paco.me) | Name, two sentences, then a three-column link index. All of it fits in one viewport. | 640px column, left-aligned inside a wide page, generous vertical gaps. | Everything is 16px. Hierarchy comes from weight, grey level and one serif italic phrase. | Titles with a one-line description. No images. | Restraint itself: the absence of a hero. | Measured: 7 animations, page is 1424px tall. Never moves layout. |
| [brittanychiang.com](https://brittanychiang.com) | Sticky left column (name 48/700, role, one-liner, section nav, social icons) against a scrolling right column. | Two columns, roughly 40/60. Left never moves. | Small body, date column in uppercase 12px, chips for stack. | Experience rows: date left, role and outcome right, chips under. | Known: a soft radial spotlight following the cursor and whole-row hover highlight. | Measured: 0 running animations at rest. Never scroll-jacks. Note this layout is now the most cloned developer portfolio on the web, so copying it reads as a template. |
| [leerob.com](https://leerob.com) | Handle as H1, a Bio block with a Default/Long switch, and a tall illustration filling the right third. | Text column left, image right, hard ruled lists. | Serif (Iowan Old Style) at 17px. H1 42px. | Ruled list, title left, date right-aligned. | The Default/Long bio toggle: the reader chooses the depth. | Measured: 107 animations registered (mostly idle transitions). Never animates on scroll. |
| [emilkowal.ski](https://emilkowal.ski) | Name and role as two 16px lines, then "Today". | One 640px column. Section gaps about 3× paragraph gaps. | 16px throughout, two greys. No H1 at all. | Name plus one-line description pairs. | Known: the craft sits in his components (Sonner, Vaul), not on the homepage. | Measured: 0 running animations. His own essay "You Don't Need Animations" is on the page. |
| [linear.app](https://linear.app) | Left-aligned two-line headline, one grey sentence, then the real product UI running off the bottom of the viewport. | 1280 container, headline hard left, a single link pushed hard right on the same baseline as the sub. | 64px, weight 510, tracking −1.4px. Second statement further down is two-tone: first clause white, the rest grey. | The product itself is the hero image, cropped by the fold. | The two-tone paragraph and the UI crop that makes you scroll to see the rest. | Measured: 86 animations, no canvas. Motion lives inside the product mock. Never on the headline. |

### Galleries

| Source | What I took from it |
| --- | --- |
| [godly.website](https://godly.website) | Recent picks are dominated by one strong image per site: a flat saturated field, a single object, heavy grain or halftone. Almost none are centered headline plus three cards. Dark sites there use true black with one colour, never a tinted glow. |
| [Awwwards, portfolio category](https://www.awwwards.com/websites/portfolio/) | Current winners lead with either an oversized name or statement anchored bottom-left, or with the work itself as a dense grid. Several put availability in the header as plain text. |
| land-book.com | Blocked (see above). |

### Five more current portfolios (ten captured, the useful ones listed)

| Site | Above the fold | Grid and rhythm | Type behaviour | How work is shown | Signature | Motion does / never does |
| --- | --- | --- | --- | --- | --- | --- |
| [gilhuybrecht.com](https://gilhuybrecht.com) (Awwwards SOTD, Sep 2026) | No headline. A six-column header row carries everything: name, "Available September 2026", services, recognition, profile, email. | Strict column grid on true black, large empty band, then work. | One size, one weight, white on black. | A contact sheet: small real screenshots, each numbered, grouped under the client name. | The numbered contact sheet with a Grid/Gallery switch. | Known: thumbnails expand in place. Never decorative. |
| [dennissnellenberg.com](https://dennissnellenberg.com) | Full-bleed portrait, surname as a huge sliding line crossing the portrait, role set small and off-axis on the right, "Located in the Netherlands" tab on the left edge. | Elements pinned to the four edges with the portrait in the middle. | Display line near 200px, everything else under 30px. | Hover-reveal list below. | Type crossing the portrait. | Known: smooth-scroll library and a marquee. This is the scroll-jacking to avoid, however good the composition. |
| [nan.fyi](https://nan.fyi) | Sticky left column with a two-line serif title; right column of ruled rows. | Left column fixed 320px, dashed rules, small crosses at rule intersections. | Serif display against a plain grotesque body. | Row: hand-drawn icon, title, date, one-paragraph description, arrow. | The drawn icon per row and the registration crosses. | Measured: none at rest. Known: the motion is inside the articles. |
| [benji.org](https://benji.org) | Name, "Updated Aug 22, 2026", five short paragraphs with inline links. | One 550px column. | 14px body. | Ruled list grouped by year, date right-aligned. | A hand-drawn pink ring around the word "New", and "2:13pm in Los Angeles" as the last line. The accent appears exactly once. | Never more than a hover. |
| [raphaelsalaja.com](https://raphaelsalaja.com) | Name, role, prose with a small favicon before each company name. | One 640px column. | 14px body. | Text pairs, plus one playable toy in a framed box. | Inline favicons in running text; one interactive object in an otherwise still page. | One toy. Everything else is static. |
| [jakub.kr](https://jakub.kr) | Name / role on one line, two sentences with inline icons, ⌘K hint. | One column, icon tiles left of each row. | 16px. | Tile, title, description. | Inline icon links and the command palette. | Hover only. |
| [tamalsen.dev](https://tamalsen.dev) (anti-reference) | Centered all-caps name over a glowing 3D render, mono tagline, "as featured in" logo row. | Centered everything, then "My Expertise" as three equal bordered cards. | Mono `// nav` labels with numerals, heavy sans display. | Cards. | None. Every element is a familiar one. | Measured: canvas background running continuously. |

Also captured and not carried forward: joshwcomeau.com (illustration-led, a different register), shud.in (prose only), antfu.me (prose only).

### Mobbin patterns

Hero
- [Analogue Agency](https://mobbin.com/sites/sections/ec7c6b3a-accc-48a3-b3b9-c5a87f7d63bf): tiny label hard left, headline starting at the page midpoint, a single contact chip with a face on it.
- [Metalab](https://mobbin.com/sites/sections/a2993c2f-3099-46c7-986d-10963d43ff1a): headline low and off-axis, client names as a vertical list on the left edge, local time in the nav.

Work index
- [Locomotive](https://mobbin.com/sites/sections/d7f7059d-53e2-4055-83e2-4408b715a307): project names as display type between full-width rules.
- [A24](https://mobbin.com/sites/sections/b645a881-adf5-43f3-a86c-758cd54f0b72): left-aligned display titles with the year as a superscript.
- [Cloudstudio](https://mobbin.com/sites/sections/48890788-7d16-4887-baaa-5b22583ef055): image tiles with a mono index top-left and one large number bottom-right.
- [MOUTHWASH](https://mobbin.com/sites/sections/e2bc218a-3568-43c0-a95e-b95b0d829e6c): two images of deliberately unequal size, caption under each.

Case-study page
- [COLLINS](https://mobbin.com/sites/sections/213b1c6a-6655-4330-965d-4851cf1e25cd): "Case Study" label in the left column, title starting four columns in, images running off the right edge.
- [Nite Riot](https://mobbin.com/sites/sections/d8c6801c-2eaa-48ed-b55b-5c74d0042347): title straddling a split, a three-row credits table (label, key, value).
- [Shopify Plus](https://mobbin.com/sites/sections/80170643-39f3-4aea-b233-37ed983ccdc2): outcome as the headline, a three-column facts row directly beneath.
- [Tailscale](https://mobbin.com/sites/sections/84f94fa1-216c-40e9-aa21-d4b6e8039f5b): large media left, metadata as a quiet sidebar.

Contact
- [basement.studio](https://mobbin.com/sites/sections/a2f3898a-cd70-4d7d-b549-5f5dbb5a9fa6) and [TinyWins](https://mobbin.com/sites/sections/4709c617-7bd3-4369-a54c-34c973a2c37e): the email address is the headline.
- [Aino](https://mobbin.com/sites/sections/1083cf3c-a197-4ee7-9632-e9bfe0d4e416): "Open Gmail" and "Copy email" as two plain buttons under the address.
- [Mother Design](https://mobbin.com/sites/sections/23a43fc2-e616-4b49-945c-4a0dd97df268): city with live local time and GMT offset.

## Synthesis: what separates designed from templated in 2026

1. **The first screen is information, set as typography.** Gil Huybrecht's header and Paco's index both answer "who, what, available when, how to reach" before any decoration. Recruiters get the essentials because the essentials are the design. The templated version hides the same facts in a glass card next to a slogan.
2. **Left edge, hard.** Linear, Rauno, Brittany, Lee Robinson, Nan and A24 all anchor to a left margin and let the right side run ragged or empty. Not one of the sixteen strong references centers a headline over a row of cards.
3. **Two type sizes, far apart.** Rauno runs 85px against 13px. Dennis runs about 200px against 20px. Paco goes the other way with a single 16px. The templated look is the middle: a 48 to 58px headline, 30px section titles, 18px lead, 14px body, each one step from the next.
4. **Section labels are rare.** The mono uppercase eyebrow above every heading is the strongest single template tell in the current build. In the references a label appears where it carries data (a date, a count, an index) and nowhere else.
5. **Rules, not boxes.** Lists are separated by hairlines (Lee Robinson, Benji, Nan, Locomotive). Bordered, rounded, filled cards are used for media only.
6. **Work is shown as the real thing, at a size where you can read it.** Linear crops its own UI with the fold. Gil numbers real screens. Cloudstudio pairs each tile with one hard number. Nobody shows work as six equal thumbnails with a stack line.
7. **The accent appears once per view and it is flat.** Rauno's yellow circle, Benji's pink ring. No tinted radial washes anywhere in the strong set.
8. **One signature per page, and it does a job.** Rauno's ruler is navigation. Lee Robinson's toggle controls depth. Benji's clock is a timezone answer. The annotated screenshot on the case-study pages is already this kind of device, so it should be the site's signature and nothing on the landing should compete with it.
9. **Motion is close to absent at rest.** Brittany and Emil measure zero running animations. Where motion exists it responds to the reader (hover, press, scrub). Native scroll everywhere except Dennis, which is the cautionary case.
10. **Time and place are stated as facts.** "Available September 2026" (Gil), "2:13pm in Los Angeles" (Benji), city plus GMT offset (Mother Design). Plain text, no pulsing dot.

## AI-slop tells to kill in the current build

Each one is visible in the baseline capture of `/` and `/work/biocirv/`.

| Tell | Where it is now | Replace with |
| --- | --- | --- |
| Amber radial glow behind the hero | `.glow` in `globals.css`, hero section | Flat `bg-base`. Amber as solid marks only (rule 7). |
| Interactive dot-grid canvas | `cursor-grid.tsx` | Remove. It decorates and costs JS on the LCP path. |
| Slogan headline with a coloured full stop | Hero H1 | A factual statement set large (rule 1), no accent punctuation. |
| Glass "recruiter card" with avatar circle, label grid and pulsing green dot | Hero `aside` | The same facts as an open typographic block on the grid. Green is outside the palette; the status becomes amber text. |
| Mono uppercase eyebrow on every section | `Section` component, case-study page, about page | Delete the default. Labels only where they carry data (rule 4). |
| Marquee ticker | `ticker.tsx` | Remove. Client names move into the work index where they are attached to proof. |
| Equal card grid with one orphan | Work section: 2+1, 3, then a lone card | A ruled index with real hierarchy (rules 5 and 6). |
| Four-up numbered process cards | "How an engagement runs" | Prose with one large figure. The numbers 01 to 04 imply a sequence that is not one. |
| Chip cloud | Stack list under the process cards and on case studies | A plain grouped text list. |
| Boxed CTA card repeating the hero | `#contact` | The email address as the headline (basement.studio, TinyWins). |
| `animate-ping` on hotspots and status | `annotated-shot.tsx`, hero | Static markers. Motion on interaction only (rule 9). |
| Fade-up reveal on every hero element | `.reveal` classes | One short entrance on the hero line at most. |
| `scroll-behavior: smooth` on `html` | `globals.css` | Remove. It changes how the reader's own scroll and in-page jumps feel. |
| Everything inside a 1152px centered container | `Container` | A wider grid with content anchored to its left edge and one element per section breaking it. |
