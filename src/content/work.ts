export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  tagline: string;
  /** One line for image captions on the landing wall. */
  short?: string;
  period: string;
  role: string;
  context: string;
  location: string;
  url?: string;
  stack: string[];
  summary: string;
  highlights: string[];
  outcome?: string;
  /** The screenshot. Absent while a study has none: its page and the links to it then show no picture. */
  image?: { src: string; alt: string; width: number; height: number };
  /** Hotspots on the hero image, in percent of width/height, with the decision or feature they point at. */
  annotations: Annotation[];
  /**
   * Extra screens for the case-study page, as the alt text of each: `screens[N - 1]` says what
   * /images/work/<slug>-screen-N.webp shows. None of them repeats the opening picture.
   */
  screens: string[];
  /** The screens are whole phone captures: shown uncropped, in portrait. */
  phone?: boolean;
  /** A 16:10 plate exists at /images/work/<slug>-plate.webp beside the image. Every featured study has one. */
  plate?: boolean;
  featured: boolean;
};

export type Annotation = { x: number; y: number; title: string; text: string };

export const WORK: CaseStudy[] = [
  {
    slug: 'biocirv',
    client: 'BioCirV',
    title: 'BioCirV Data Portal',
    tagline: 'A public biomass-discovery platform, built from scratch on Next.js 16 / React 19.',
    short: 'Next.js 16 data portal, from scratch',
    period: 'Feb 2026 – Jul 2026',
    role: 'Frontend lead (via Agilno)',
    context: 'Public data platform for the bio-circular economy',
    location: 'California, US',
    url: 'https://biocirv.beamcircular.org',
    stack: ['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'TanStack Query', 'React Hook Form', 'Zod', 'Recharts', 'Django REST API'],
    summary:
      'Researchers and companies need to find biomass feedstocks and compare their properties. I built the public discovery UI from a blank repo: search with autocomplete, faceted filters, interactive maps, biomass profiles and analytics dashboards over a Django REST API.',
    highlights: [
      'Designed the TanStack Query data layer with URL-synced filter state, so every search is a shareable link and results stay cached across navigation.',
      'Owned the frontend foundation two other developers built on: the component system, typed forms (React Hook Form + Zod), the Figma-to-code workflow, commit conventions and QA handoff. I also reviewed their pull requests.',
      'Responsive and accessible by default: semantic HTML, keyboard navigation, Recharts dashboards with readable fallbacks.',
    ],
    outcome: 'Shipped as the public face of the platform. The team still builds on that foundation.',
    image: { src: '/images/work/biocirv.webp', alt: 'BioCirV Data Portal discovery page with biomass cards and filters', width: 1600, height: 1000 },
    annotations: [
      { x: 39.8, y: 35.3, title: 'Search over a Django REST API', text: 'Debounced autocomplete; the query lives in the URL, so every search is a shareable link and TanStack Query serves repeats from cache.' },
      { x: 5.6, y: 37.1, title: 'Faceted filters as URL state', text: 'Filter combinations are serialised into the address bar and restored on load; no global store, no stale results after navigation.' },
      { x: 35.75, y: 76, title: 'The component system others built on', text: 'Typed cards, forms (React Hook Form + Zod) and tables that two other developers extended; I reviewed their pull requests.' },
    ],
    screens: [
      'BioCirV performance overview with key figures, a bar chart and line charts',
      'BioCirV almond hulls profile with a photo, key figures and analysis charts',
      'BioCirV discovery results as a sortable table with three filters applied',
    ],
    featured: true,
  },
  {
    slug: 'oncallable',
    client: 'OnCallable',
    title: 'OnCallable',
    tagline: 'A hard-coded marketing site moved onto Sanity in about two weeks, so editors publish without a developer.',
    short: 'Sanity replatform in about two weeks',
    period: 'Jan 2026 – Jul 2026',
    role: 'Frontend developer (via Agilno)',
    context: 'Marketplace connecting customers with service professionals',
    location: 'US',
    url: 'https://oncallable.com',
    stack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Sanity CMS'],
    summary:
      'The marketing site was hard-coded, so every copy change needed a developer deploy. I moved it onto Sanity with a page-builder schema: editors now ship pages, sections, popups, redirects and A/B tests themselves.',
    highlights: [
      'Replatformed the whole site in about two weeks without a content freeze.',
      'Set up SEO and answer-engine optimisation: structured FAQ data (JSON-LD), per-page metadata and clean URLs.',
      'Zero developer deploys for content since launch.',
    ],
    image: { src: '/images/work/oncallable.webp', alt: 'OnCallable marketing site home page', width: 1600, height: 1000 },
    annotations: [
      { x: 31, y: 26, title: 'Every word is a Sanity document', text: 'Headlines, sections and calls to action are editable content with a page-builder schema; editors publish without a developer deploy.' },
      { x: 61, y: 10.4, title: 'Sections you can reorder and A/B test', text: 'Each block is a schema type with variants, so marketing runs experiments, popups and redirects from the CMS.' },
      { x: 34, y: 71.5, title: 'Forms defined in the CMS', text: 'Lead capture reads its fields and destination from Sanity; adding a form is content, not code.' },
    ],
    screens: [
      'OnCallable page for professionals with four benefits and a map of jobs',
      'OnCallable customer page with a map of professionals and three profile cards',
    ],
    featured: true,
  },
  {
    slug: 'suello',
    client: 'Suello',
    title: 'Suello companion app',
    tagline: 'A React Native app for a Bluetooth smart planter, built from scratch.',
    short: 'React Native and a Bluetooth device layer',
    period: 'Apr 2025 – Nov 2025',
    role: 'Mobile developer (via Agilno)',
    context: 'IoT startup building a Bluetooth-connected smart planter',
    location: 'Toronto, Canada',
    url: 'https://www.linkedin.com/company/suello/',
    stack: ['React Native 0.78', 'TypeScript', 'Bluetooth Low Energy'],
    summary:
      'I built the companion app from scratch: the Bluetooth Low Energy pairing and device-communication layer, authentication, and onboarding with custom animations. The project ended before a hardware prototype was ready, so it never ran on a real planter.',
    highlights: [
      'BLE device layer with reconnects and retries for connection drops and app backgrounding, tested against a test device.',
      'Authentication and account flows wired to the backend.',
      'Onboarding with custom animations that explain pairing without a manual.',
    ],
    image: { src: '/images/work/suello.webp', alt: 'Three Suello app screens: adding a plant, the home screen with a connected planter, and a plant’s sensor readings', width: 1600, height: 1000 },
    annotations: [
      { x: 37.5, y: 27, title: 'Reminders from device state', text: 'Built for soil-moisture data over Bluetooth Low Energy (BLE), with watering prompts computed offline on the phone. UI only: no planter sent any.' },
      { x: 49.6, y: 41.3, title: 'Planter status', text: 'The “Doing well” badge is designed to follow the sensor readings subscribed through the BLE layer I built from scratch.' },
      { x: 56, y: 66.7, title: 'Connection and battery status', text: 'Reconnect and retry logic handles drops and app backgrounding so pairing and onboarding feel instant. Tested against a test device, not a real planter.' },
    ],
    screens: [
      'Suello profile screen with settings and help menus',
      'Suello add-plant screen with search and a list of common plants',
      'Suello plant screen with a “Needs more light” badge and sensor readings',
    ],
    phone: true,
    featured: true,
  },
  {
    slug: 'vetster',
    client: 'Vetster',
    title: 'Vetster',
    tagline: 'Vue.js features and Laravel backend work on a 24/7 pet-telehealth platform with 100k+ app users.',
    short: 'Vue.js features and Laravel backend, 100k+ users',
    period: 'Jul 2024 – Apr 2025',
    role: 'Full-stack developer (via Agilno)',
    context: 'Pet telehealth marketplace',
    location: 'Toronto, Canada',
    url: 'https://vetster.com',
    stack: ['Vue.js', 'Laravel', 'PHP', 'PostgreSQL'],
    summary:
      'Vetster connects pet owners with licensed vets over video. I shipped Vue.js features on the vet side (onboarding, profile and account-settings screens) and the Laravel controllers and database migrations behind user and vet profile data.',
    highlights: [
      'Vet onboarding, profile and account-settings screens in Vue.js on a live platform with 100k+ app users.',
      'Laravel controllers and migrations for user and vet profile data: profile fields, onboarding state, account settings.',
      'Worked inside an established codebase with code review and staged releases.',
    ],
    image: { src: '/images/work/vetster.webp', alt: 'Vetster find-a-vet page with a vet search and species picker', width: 1600, height: 1000 },
    annotations: [
      { x: 40.5, y: 7.8, title: 'Vet-side flows in Vue.js', text: 'Onboarding, profile and account-settings screens shipped inside an established Vue.js codebase with staged releases.' },
      { x: 29.3, y: 33.3, title: 'Profile data from Laravel', text: 'The vet profile fields are backed by controllers and migrations I wrote, with PostgreSQL underneath.' },
      { x: 65, y: 55, title: '100k+ users, zero-downtime changes', text: 'Every change went through code review and staged releases on a 24/7 video-consultation platform.' },
    ],
    screens: [
      '“Ask Vetster anything” chat with species, availability and health-issue options',
      'Vetster dog-vet page: how online care works and lists of vets',
    ],
    featured: true,
  },
  {
    slug: 'naitur',
    client: 'Naitur',
    title: 'Naitur',
    tagline: 'The frontend of a US-regulated (HIPAA) psilocybin-therapy platform.',
    short: 'HIPAA frontend, e-signature, magic links',
    period: 'Aug 2023 – Jul 2024',
    role: 'Frontend developer (via Agilno)',
    context: 'Platform for licensed psilocybin-therapy clinics and facilitators',
    location: 'Oregon, US',
    url: 'https://naitur.ai',
    stack: ['React', 'TypeScript', 'REST API (Node.js backend)', 'HIPAA-compliant infrastructure'],
    summary:
      'Clinics and facilitators run screening, sessions and follow-ups on Naitur. I shipped the responsive frontend: JWT magic-link authentication, multi-party e-signature flows, data tables, export and analytics on HIPAA-compliant infrastructure.',
    highlights: [
      '100+ facilitators and 15+ clinics onboarded in the platform’s first week.',
      'JWT magic-link authentication and multi-party e-signature flows for consent documents.',
      'Clinical forms (standard scales), response views, data tables and CSV export.',
    ],
    image: { src: '/images/work/naitur.webp', alt: 'Naitur journey dashboard with phased activities', width: 1600, height: 1000 },
    annotations: [
      { x: 48.8, y: 35.2, title: 'Phased journey pipeline', text: 'Screening → Facilitation → Integration as typed data tables with status chips; clinics track every client step.' },
      { x: 29.5, y: 40.6, title: 'Multi-party e-signature', text: 'Consent documents move through signer roles with pending/complete states, all on HIPAA-compliant infrastructure.' },
      { x: 82.5, y: 54, title: 'Scheduling and magic-link authentication', text: 'Sessions sync to calendars; users sign in with JSON Web Token (JWT) magic links instead of passwords.' },
    ],
    screens: [
      'Naitur forms list: questionnaires and rating scales, each with a Send action',
      'Naitur response view: a questionnaire answered on a five-point agreement scale',
    ],
    featured: true,
  },
  {
    slug: 'buddyins',
    client: 'BuddyIns',
    title: 'BuddyIns',
    tagline: 'A Next.js frontend for a long-term-care insurance platform, over a Django API with PayPal subscription payments.',
    short: 'Next.js over Django, PayPal subscriptions',
    period: 'Jan 2023 – Jul 2023',
    role: 'Frontend developer (via Agilno)',
    context: 'US long-term-care insurance platform',
    location: 'US',
    url: 'https://buddyins.com',
    stack: ['Next.js', 'React', 'Django REST API', 'PayPal API'],
    summary:
      'Insurance agents manage clients and plans on BuddyIns. I built the Next.js frontend over the Django REST API: authentication flows, PayPal subscription checkout, CRUD screens, data tables and CSV export.',
    highlights: [
      'PayPal subscription checkout integrated end to end with the Django backend.',
      'Authentication flows, CRUD screens and data tables with export for agents.',
    ],
    image: { src: '/images/work/buddyins.webp', alt: 'BuddyIns agent dashboard with activity feed', width: 1600, height: 1000 },
    annotations: [
      { x: 15.5, y: 19, title: 'Benefit Buddy plan builder', text: 'Create, read, update and delete (CRUD) screens over the Django REST API for building and sharing long-term-care plans.' },
      { x: 33.8, y: 14.5, title: 'Activity feed and tables', text: 'Data tables with sorting and CSV export so agents can work their book outside the app.' },
      { x: 20.6, y: 95.5, title: 'PayPal subscriptions gate the tools', text: 'Subscription checkout integrated end to end; the tier on the account unlocks sales tools.' },
    ],
    screens: [
      'Benefit Buddy tax-savings table with yearly premiums, cost of care and self-funding',
      'Benefit Buddy premium view comparing two plans side by side, with charts',
      'Benefit Buddy plans page with a table of plans and case-study templates',
    ],
    featured: true,
  },
  {
    slug: 'carcatcher',
    client: 'amondi GmbH',
    title: 'Car Catcher',
    tagline: 'An online car-auction platform, built as a CMS-driven React app.',
    period: 'Apr 2022 – Nov 2022',
    role: 'Frontend Web Developer',
    context: 'Media & IT development agency',
    location: 'Zagreb, Croatia (hybrid)',
    stack: ['React', 'JavaScript', 'CSS', 'Headless CMS'],
    summary:
      'car-catcher.de is a used-car auction platform: listings with vehicle data and damage reports, and a step-by-step flow for putting a car up for auction. I built its screens in React from CMS content.',
    highlights: [
      'Vehicle listing, vehicle-data and damage-report screens from CMS content.',
      'The create-auction steps: the vehicle-data form and damage marking on a car diagram.',
    ],
    image: { src: '/images/work/carcatcher.webp', alt: 'car-catcher.de vehicle listing with the bidding panel', width: 1600, height: 1000 },
    plate: true,
    annotations: [
      { x: 15.5, y: 22, title: 'Condition before the price', text: 'Drive-ready, defects and fixed damage are flagged under the title, ahead of the full damage report further down the page.' },
      { x: 42.5, y: 45.8, title: 'Bidding on a running auction', text: 'The current highest bid, a field for a new bid, a bidding agent and an instant purchase price, with the time left beside the title.' },
      { x: 9.8, y: 77.8, title: 'Vehicle data from the CMS', text: 'Consignor, distance, pickup and transport cost in one row, then the full vehicle-data table, all rendered from CMS content.' },
    ],
    screens: [
      'car-catcher.de create-auction step 2: the vehicle-data form with paint-thickness fields',
      'car-catcher.de create-auction step 4: damage markers on a car diagram',
    ],
    featured: false,
  },
  {
    slug: 'buildmycareer',
    client: 'amondi GmbH',
    title: 'BuildMyCareer',
    tagline: 'A careers portal and the job-pipeline dashboard behind it, built in React.',
    period: 'Apr 2022 – Nov 2022',
    role: 'Frontend Web Developer',
    context: 'Media & IT development agency',
    location: 'Zagreb, Croatia (hybrid)',
    stack: ['React', 'JavaScript', 'CSS', 'Headless CMS'],
    summary:
      'buildmycareer.de is a careers portal with a large job-pipeline dashboard behind it, where admins managed jobs and the applications coming in for them. I built the React frontend, with the portal content managed in a CMS.',
    highlights: ['Job-pipeline dashboard where admins managed jobs and applications.', 'Careers portal frontend with CMS-managed content.'],
    annotations: [],
    screens: [],
    featured: false,
  },
  {
    slug: 'agrivi',
    client: 'Reroot (contract)',
    title: 'Agrivi marketing site',
    tagline: 'Full redesign of the marketing site of a farm-management SaaS.',
    period: 'Jul 2020 – Mar 2021',
    role: 'Web Developer (contract)',
    context: 'Farm-management software',
    location: 'Remote',
    url: 'https://www.agrivi.com',
    stack: ['WordPress', 'PHP', 'Multilingual'],
    summary: 'I rebuilt Agrivi’s multilingual marketing site on WordPress with a custom theme.',
    highlights: ['Custom WordPress theme, multilingual content, performance pass.'],
    image: { src: '/images/work/agrivi.webp', alt: 'Agrivi marketing site home page, Croatian version', width: 1600, height: 1000 },
    annotations: [],
    screens: [
      'Agrivi product page with app screenshots and four key figures, in Croatian',
      'Agrivi case-studies page with a grid of customer stories, in Croatian',
      'Agrivi about page over an aerial photo of a farm, in Croatian',
    ],
    featured: false,
  },
  {
    slug: 'robinson',
    client: 'Robinson Restaurant',
    title: 'Robinson Restaurant',
    tagline: 'A custom WordPress theme for a beach restaurant; the owner reported enquiries up by about 200%.',
    period: '2019 – 2021',
    role: 'Freelance web developer',
    context: 'Island beach restaurant',
    location: 'Hvar, Croatia',
    url: 'https://robinson-hvar.com',
    stack: ['WordPress', 'PHP', 'JavaScript'],
    summary: 'I designed and built the restaurant’s site from scratch as a custom WordPress theme, with reservations and a photo-led layout.',
    highlights: ['The owner reported enquiries up by about 200% after launch.'],
    image: { src: '/images/work/robinson.webp', alt: 'Robinson Restaurant home page over a photo of a pebble cove seen through pine trees', width: 1600, height: 1000 },
    annotations: [],
    screens: [
      'Robinson Restaurant gallery page with a grid of photos and category filters',
      'Robinson Restaurant menu page: main courses and a wine list with prices',
      'Robinson Restaurant “Our restaurant” section beside a photo of its painted sign',
    ],
    featured: false,
  },
];

export const FEATURED = WORK.filter((w) => w.featured);
/** Whether the study's lead picture is its plate (the hero's crop) and not the plain screenshot. */
export const hasPlate = (w: CaseStudy) => w.image !== undefined && (w.featured || w.plate === true);
export const EARLIER = WORK.filter((w) => !w.featured);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return WORK.find((w) => w.slug === slug);
}
