"""Build cv/frontend.html and cv/fullstack.html from one content model. Usage: python3 cv/build.py cv  (then cv/render.sh)."""
import re
import sys
from pathlib import Path

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent
import re as _re
CSS_OVERRIDE = """
  :root{--sans:'Liberation Sans',Arial,sans-serif;--mono:'Liberation Mono',monospace}
  body{font-size:10.4px;line-height:1.36}
  .stack{font-size:8.5px} .row .dates{font-size:9px} h2{font-size:9.5px}
  section{margin-top:7px} h2{margin-bottom:5px}
  @page{margin:6mm 12mm 6mm}
  ul{list-style:disc outside;padding-left:13px} li{position:static;padding-left:0}
  li::before{content:none} li::marker{color:var(--amber-text)}
  .row{display:table;width:100%} .row>h3,.row>.what{display:table-cell;vertical-align:baseline}
  .row .dates{display:table-cell;text-align:right;padding-left:12px;vertical-align:baseline;width:1%}
  .stack{color:#52525b}
  h1 .dot{display:inline-block;width:.17em;height:.17em;border-radius:50%;background:#d97706;margin-left:.06em;vertical-align:baseline}
"""
# Drop the @font-face blocks: the PDF embeds static TrueType fonts (Chrome embeds variable woff2 as Type 3,
# which some ATS parsers mishandle).
STYLE = re.sub(r"@font-face \{.*?\}\n", "", (OUT / "style.html").read_text(), flags=re.S).replace(
    "</style>", CSS_OVERRIDE + "</style>"
)

SEP = '<span class="sep" aria-hidden="true">·</span>'

VARIANTS = {
    "frontend": {
        "file": "frontend.html",
        "title": "Kristijan Krešić · Frontend engineer (React / Next.js / TypeScript)",
        "headline": "Frontend engineer · React / Next.js / TypeScript",
        "summary": (
            "Frontend engineer, 4+ years professional (building for the web since 2016). Built six client products in React / Next.js / "
            "TypeScript and React Native for North American clients in insurance, HIPAA healthcare, telehealth and IoT, "
            "most recently a public data portal on Next.js 16 / React 19. Owns the frontend end to end: "
            "architecture, data layer, component system, forms, accessibility, performance and delivery, remote and async with distributed teams."
        ),
        "skills": [
            ("Frontend", "React, Next.js (App Router, SSR/SSG), TypeScript, JavaScript, Vue.js, Tailwind CSS, HTML5, CSS3, TanStack Query, React Hook Form, Zod, Recharts, Astro"),
            ("Mobile", "React Native, BLE / Bluetooth Low Energy integrations"),
            ("Backend", "PHP / Laravel, REST API integration (Django REST, Laravel, Node.js backends), PostgreSQL, MySQL"),
            ("Testing &amp; quality", "Vitest, Playwright (browser QA), accessibility (semantic HTML, keyboard navigation, Lighthouse a11y audits), web performance (Lighthouse, Core Web Vitals), CI/CD (GitHub Actions, Bitbucket Pipelines), ESLint, Prettier"),
            ("Tooling &amp; languages", "Git, Vercel, Sanity CMS, WordPress, Figma, Claude Code, Cursor · English (fluent), Croatian (native)"),
        ],
    },
    "fullstack": {
        "file": "fullstack.html",
        "title": "Kristijan Krešić · Software engineer (React / Next.js / TypeScript / Laravel)",
        "headline": "Software engineer · React / Next.js / TypeScript · Laravel",
        "summary": (
            "Frontend-led full-stack engineer, 4+ years professional (building for the web since 2016). Built six client products in React / "
            "Next.js / TypeScript and React Native for North American clients in insurance, HIPAA healthcare, telehealth and IoT, "
            "most recently a public data portal on Next.js 16 / React 19. Owns the frontend end to end and works across "
            "the stack when the team needs it: Laravel controllers and migrations, REST integration over Django and Node.js backends, CMS and payments."
        ),
        "skills": [
            ("Frontend", "React, Next.js (App Router, SSR/SSG), TypeScript, JavaScript, Vue.js, Tailwind CSS, HTML5, CSS3, TanStack Query, React Hook Form, Zod, Recharts, Astro"),
            ("Backend", "Laravel / PHP (controllers, migrations), WordPress theme development (PHP), REST API integration (Django REST, Laravel, Node.js backends), PostgreSQL, MySQL, PayPal API, Sanity CMS"),
            ("Mobile", "React Native, BLE / Bluetooth Low Energy integrations"),
            ("Testing &amp; quality", "Vitest, Playwright (browser QA), accessibility (semantic HTML, keyboard navigation, Lighthouse a11y audits), web performance (Lighthouse, Core Web Vitals), CI/CD (GitHub Actions, Bitbucket Pipelines), ESLint, Prettier"),
            ("Tooling &amp; languages", "Git, Vercel, WordPress, Figma, Claude Code, Cursor · English (fluent), Croatian (native)"),
        ],
    },
}

PROJECTS = [
    {
        "name": "BioCirV Data Portal",
        "hook": 'public biomass-discovery platform (<a href="https://biocirv.beamcircular.org">biocirv.beamcircular.org</a>)',
        "dates": "Feb 2026 – Jul 2026",
        "bullets": [
            "Built the public discovery UI from scratch, responsive and accessible (semantic HTML, keyboard navigation): search with autocomplete, faceted filters, interactive maps, biomass profiles and Recharts dashboards over a Django REST API.",
            "Designed the data layer (TanStack Query + URL-synced filter state) so every search is a shareable link and results stay cached across navigation.",
            "Owned the frontend foundation two other developers built on: component system, typed forms (React Hook Form + Zod), Figma-to-code workflow, commit conventions and QA handoff. Reviewed their pull requests.",
        ],
        "stack": "Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Zod",
    },
    {
        "name": "OnCallable",
        "hook": 'marketplace connecting customers with service professionals (<a href="https://oncallable.com">oncallable.com</a>)',
        "dates": "Jan 2026 – Jul 2026",
        "bullets": [
            "Moved a hard-coded marketing site onto Sanity in about two weeks; editors now ship pages, sections, popups, redirects and A/B tests themselves, with zero developer deploys for content.",
            "Set up SEO and answer-engine optimisation with structured FAQ data (JSON-LD).",
        ],
        "stack": "Next.js 14 · TypeScript · Tailwind CSS · Sanity",
    },
    {
        "name": "Suello",
        "hook": 'app for a Bluetooth-connected smart planter, Toronto IoT startup (<a href="https://www.linkedin.com/company/suello/">suello on LinkedIn</a>)',
        "dates": "Apr 2025 – Nov 2025",
        "bullets": [
            "Built the companion app from scratch in React Native: the Bluetooth Low Energy (BLE) pairing and device-communication layer with reconnects and retries, tested against a test device; authentication; onboarding with custom animations. The project ended before a hardware prototype was ready, so the app never ran on a real planter.",
        ],
        "stack": "React Native 0.78 · TypeScript",
    },
    {
        "name": "Vetster",
        "hook": 'pet-telehealth marketplace, Toronto (<a href="https://vetster.com">vetster.com</a>)',
        "dates": "Jul 2024 – Apr 2025",
        "bullets": [
            "Shipped Vue.js features (vet onboarding, profile and account-settings screens) on a 24/7 video-consultation platform with 100k+ app users.",
            "Backend: Laravel controllers and database migrations for user and vet profile data (profile fields, onboarding, account settings).",
        ],
        "stack": "Laravel · PHP · Vue.js · PostgreSQL",
    },
    {
        "name": "Naitur",
        "hook": 'platform for licensed psilocybin-therapy clinics (US, HIPAA · <a href="https://naitur.ai">naitur.ai</a>)',
        "dates": "Aug 2023 – Jul 2024",
        "bullets": [
            "Shipped the responsive frontend for a US-regulated platform (100+ facilitators and 15+ clinics onboarded in its first week).",
            "Built JWT magic-link authentication, multi-party e-signature flows, data tables, export and analytics on HIPAA-compliant infrastructure.",
        ],
        "stack": "React · TypeScript · REST API (Node.js backend)",
    },
    {
        "name": "BuddyIns",
        "hook": 'US long-term-care insurance platform (<a href="https://buddyins.com">buddyins.com</a>)',
        "dates": "Jan 2023 – Jul 2023",
        "bullets": [
            "Built the Next.js frontend: authentication flows, PayPal subscription checkout, CRUD screens, data tables and CSV export.",
        ],
        "stack": "Next.js · React · Django REST API · PayPal API",
    },
]

EARLY = [
    ('<strong>amondi GmbH</strong> (Zagreb, hybrid) · Frontend web developer: CMS-driven React apps (car-catcher.de, <a href="https://buildmycareer.de">buildmycareer.de</a>)', "Apr 2022 – Nov 2022"),
    ('<strong>Reroot</strong> (remote, contract) · Web developer: full redesign of the Agrivi marketing site, a farm-management SaaS (<a href="https://www.agrivi.com">agrivi.com</a> · WordPress, PHP, multilingual)', "Jul 2020 – Mar 2021"),
    ('<strong>Robinson Restaurant</strong> (Hvar · <a href="https://robinson-hvar.com">robinson-hvar.com</a>) · Freelance web developer: custom WordPress theme from scratch (PHP); the owner reported enquiries up by about 200% after launch', "2019 – 2021"),
]


def project_html(p):
    lis = "\n".join(f"      <li>{b}</li>" for b in p["bullets"])
    return f"""
  <div class="project">
    <div class="row">
      <h3 class="project-title">{p['name']} <span class="hook">· {p['hook']}</span></h3>
      <span class="dates">{p['dates']}</span>
    </div>
    <ul role="list">
{lis}
    </ul>
    <p class="stack">{p['stack']}</p>
  </div>"""


def build(v):
    projects = "".join(project_html(p) for p in PROJECTS)
    early = "\n".join(
        f'  <div class="early row"><span class="what">{w}</span><span class="dates">{d}</span></div>' for w, d in EARLY
    )
    skills = "\n".join(f'  <p class="skill-row"><span class="cat">{c}:</span> {s}</p>' for c, s in v["skills"])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{v['title']}</title>
{STYLE}
</head>
<body>

<header>
  <h1>Kristijan Krešić<span class="dot" aria-hidden="true"></span></h1>
  <p class="headline">{v['headline']}</p>
  <p class="contact">Hvar, Croatia (CET) {SEP} Available now {SEP} Remote (EU / US-East overlap) {SEP} Hybrid in Split or Zagreb {SEP} EU citizen, no visa needed</p>
  <p class="contact"><a href="mailto:kristijan.kresic.dev@gmail.com">kristijan.kresic.dev@gmail.com</a> {SEP} <a href="https://github.com/kristijan-kresic-hvar">github.com/kristijan-kresic-hvar</a> {SEP} <a href="https://www.linkedin.com/in/kkwebdev/">linkedin.com/in/kkwebdev</a></p>
</header>

<section aria-labelledby="summary">
  <h2 id="summary">Summary</h2>
  <p class="summary">{v['summary']}</p>
</section>

<section aria-labelledby="experience">
  <h2 id="experience">Experience</h2>

  <div class="role">
    <div class="row">
      <h3 class="role-title">Frontend developer, Agilno</h3>
      <span class="dates">Jan 2023 – Aug 2026</span>
    </div>
    <p class="role-desc">Product agency; embedded in six North American client teams · remote</p>
{projects}
  </div>
</section>

<section aria-labelledby="earlier">
  <h2 id="earlier">Earlier Experience</h2>
{early}
</section>

<section aria-labelledby="skills">
  <h2 id="skills">Skills</h2>
{skills}
  <p class="skill-row"><span class="cat">Public code:</span> <a href="https://github.com/kristijan-kresic-hvar/kristijankresic.com">github.com/kristijan-kresic-hvar/kristijankresic.com</a> · Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, GitHub Actions CI</p>
</section>

<section aria-labelledby="education">
  <h2 id="education">Education</h2>
  <div class="edu row"><span class="what"><strong>Algebra Bernays University (Sveučilište Algebra), Zagreb</strong> · Certificate programme: PHP &amp; MySQL Backend Development</span><span class="dates">2017 – 2018</span></div>
  <div class="edu row"><span class="what"><strong>Algebra Bernays University (Sveučilište Algebra), Zagreb</strong> · Certificate programme: Frontend Development &amp; Graphic Design</span><span class="dates">2016 – 2017</span></div>
</section>

</body>
</html>
"""


for key, v in VARIANTS.items():
    (OUT / v["file"]).write_text(build(v))
    print("wrote", OUT / v["file"])
