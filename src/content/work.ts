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
  image: { src: string; alt: string; width: number; height: number };
  /** Hotspots on the hero image, in percent of width/height, with the decision or feature they point at. */
  annotations: Annotation[];
  /** Extra screens for the case-study page: /images/work/<slug>-screen-N.webp */
  screens: number;
  /** Whether a tall /images/work/<slug>-full.webp exists for the hover-scroll card. */
  scroll: boolean;
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
      'Owned the frontend foundation two other developers built on, and reviewed their pull requests: component system, typed forms (React Hook Form + Zod), Figma-to-code workflow, commit conventions and QA handoff.',
      'Responsive and accessible by default: semantic HTML, keyboard navigation, Recharts dashboards with readable fallbacks.',
    ],
    outcome: 'Shipped as the public face of the platform; the foundation is still what the team ships on.',
    image: { src: '/images/work/biocirv.webp', alt: 'BioCirV Data Portal discovery page with biomass cards and filters', width: 1600, height: 1000 },
    annotations: [
      { x: 50, y: 47, title: 'Search over a Django REST API', text: 'Debounced autocomplete; the query lives in the URL, so every search is a shareable link and TanStack Query serves repeats from cache.' },
      { x: 26, y: 75, title: 'Faceted filters as URL state', text: 'Filter combinations are serialised into the address bar and restored on load; no global store, no stale results after navigation.' },
      { x: 50, y: 88, title: 'The component system others built on', text: 'Typed cards, forms (React Hook Form + Zod) and tables that two other developers extended; I reviewed their pull requests.' },
    ],
    screens: 3,
    scroll: true,
    featured: true,
  },
  {
    slug: 'oncallable',
    client: 'OnCallable',
    title: 'OnCallable',
    tagline: 'A static marketing site replatformed onto a CMS-driven Sanity architecture in about two weeks.',
    short: 'Sanity replatform in two weeks',
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
      'Built SEO and answer-engine optimisation: structured FAQ data (JSON-LD), metadata per page, clean URLs.',
      'Zero developer deploys for content since launch.',
    ],
    image: { src: '/images/work/oncallable.webp', alt: 'OnCallable marketing site home page', width: 1600, height: 1000 },
    annotations: [
      { x: 20, y: 38, title: 'Every word is a Sanity document', text: 'Headlines, sections and CTAs are editable content with a page-builder schema; editors publish without a developer deploy.' },
      { x: 76, y: 55, title: 'Sections you can reorder and A/B test', text: 'Each block is a schema type with variants, so marketing runs experiments, popups and redirects from the CMS.' },
      { x: 22, y: 63, title: 'Forms defined in the CMS', text: 'Lead capture reads its fields and destination from Sanity; adding a form is content, not code.' },
    ],
    screens: 3,
    scroll: true,
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
    context: 'IoT startup building a BLE-connected smart planter',
    location: 'Toronto, Canada',
    url: 'https://www.linkedin.com/company/suello/',
    stack: ['React Native 0.78', 'TypeScript', 'Bluetooth Low Energy'],
    summary:
      'The planter talks to the phone over Bluetooth Low Energy. I built the companion app from an empty project: the BLE pairing and device-communication layer, authentication, and an onboarding flow with custom animations.',
    highlights: [
      'BLE device layer that survives connection drops and app backgrounding, with retries that keep onboarding feeling instant.',
      'Authentication and account flows wired to the backend.',
      'Onboarding with custom animations that explain pairing without a manual.',
    ],
    image: { src: '/images/work/suello.webp', alt: 'Suello app home screen showing a connected planter', width: 1600, height: 1000 },
    annotations: [
      { x: 50, y: 23, title: 'Reminders from device state', text: 'Soil-moisture readings arrive over Bluetooth Low Energy; watering prompts are computed on the phone, offline-safe.' },
      { x: 50, y: 42, title: 'Live planter status', text: 'The "Doing well" badge is driven by sensor characteristics subscribed through the BLE layer I built from scratch.' },
      { x: 48, y: 66, title: 'Connection and battery that survive real life', text: 'Reconnect and retry logic handles drops and app backgrounding so pairing and onboarding feel instant.' },
    ],
    screens: 3,
    scroll: true,
    featured: true,
  },
  {
    slug: 'vetster',
    client: 'Vetster',
    title: 'Vetster',
    tagline: 'Vue.js features and Laravel backend work on a 24/7 pet-telehealth platform with 100k+ app users.',
    short: 'Vue features and Laravel backend, 100k+ users',
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
    image: { src: '/images/work/vetster.webp', alt: 'Vetster find-a-vet page', width: 1600, height: 1000 },
    annotations: [
      { x: 16, y: 50, title: 'Vet-side flows in Vue.js', text: 'Onboarding, profile and account-settings screens shipped inside an established Vue codebase with staged releases.' },
      { x: 62, y: 57, title: 'Profile data from Laravel', text: 'Controllers and migrations I wrote back the vet profile fields shown here; PostgreSQL underneath.' },
      { x: 25, y: 29, title: '100k+ users, zero downtime changes', text: 'Every change went through code review and staged rollout on a 24/7 video-consultation platform.' },
    ],
    screens: 3,
    scroll: true,
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
      'JWT magic-link auth and multi-party e-signature flows for consent documents.',
      'Clinical forms (standard scales), response views, data tables and CSV export.',
    ],
    image: { src: '/images/work/naitur.webp', alt: 'Naitur journey dashboard with phased activities', width: 1600, height: 1000 },
    annotations: [
      { x: 25, y: 30, title: 'Phased journey pipeline', text: 'Screening → Facilitation → Integration as typed data tables with status chips; clinics track every client step.' },
      { x: 22, y: 41, title: 'Multi-party e-signature', text: 'Consent documents move through signer roles with pending/complete states, all on HIPAA-compliant infrastructure.' },
      { x: 76, y: 54, title: 'Scheduling and magic-link auth', text: 'Sessions sync to calendars; users sign in with JWT magic links instead of passwords.' },
    ],
    screens: 3,
    scroll: true,
    featured: true,
  },
  {
    slug: 'buddyins',
    client: 'BuddyIns',
    title: 'BuddyIns',
    tagline: 'A Next.js frontend over a Django API with PayPal subscription payments.',
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
      'PayPal subscription checkout integrated end-to-end with the Django backend.',
      'Auth flows, CRUD screens and data tables with export for agents.',
    ],
    image: { src: '/images/work/buddyins.webp', alt: 'BuddyIns agent dashboard with activity feed', width: 1600, height: 1000 },
    annotations: [
      { x: 9, y: 19, title: 'Benefit Buddy plan builder', text: 'CRUD screens over the Django REST API for building and sharing long-term-care plans.' },
      { x: 45, y: 22, title: 'Activity feed and tables', text: 'Data tables with sorting and CSV export so agents can work their book outside the app.' },
      { x: 14, y: 95, title: 'PayPal subscriptions gate the tools', text: 'Subscription checkout integrated end-to-end; the tier on the account unlocks sales tools.' },
    ],
    screens: 3,
    scroll: true,
    featured: true,
  },
  {
    slug: 'carcatcher',
    client: 'amondi GmbH',
    title: 'car-catcher.de & buildmycareer.de',
    tagline: 'CMS-driven React apps for a German agency.',
    period: 'Apr 2022 – Nov 2022',
    role: 'Frontend Web Developer',
    context: 'Media & IT development agency',
    location: 'Zagreb, Croatia (hybrid)',
    url: 'https://buildmycareer.de',
    stack: ['React', 'JavaScript', 'CSS', 'Headless CMS'],
    summary:
      'Two CMS-driven React applications: a used-car listing platform with vehicle data and damage reports, and a careers portal.',
    highlights: ['Vehicle listing, vehicle-data and damage-report screens from CMS content.', 'Careers portal frontend with CMS-managed content.'],
    image: { src: '/images/work/carcatcher.webp', alt: 'car-catcher.de vehicle listing', width: 1600, height: 1000 },
    annotations: [],
    screens: 3,
    scroll: false,
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
    summary: 'Rebuilt the multilingual marketing site of Agrivi on WordPress with a custom theme.',
    highlights: ['Custom WordPress theme, multilingual content, performance pass.'],
    image: { src: '/images/work/agrivi.webp', alt: 'Agrivi marketing site', width: 1600, height: 1000 },
    annotations: [],
    screens: 0,
    scroll: false,
    featured: false,
  },
  {
    slug: 'robinson',
    client: 'Robinson Restaurant',
    title: 'Robinson Restaurant, Hvar',
    tagline: 'A custom WordPress theme for a beach restaurant; the owner reported inquiries up about 200%.',
    period: '2019 – 2021',
    role: 'Freelance web developer',
    context: 'Restaurant on Hvar island',
    location: 'Hvar, Croatia',
    url: 'https://robinson-hvar.com',
    stack: ['WordPress', 'PHP', 'JavaScript'],
    summary: 'Designed and built the restaurant’s site from scratch as a custom WordPress theme, with reservations and a photo-led layout.',
    highlights: ['The owner reported inquiries up about 200% after launch.'],
    image: { src: '/images/work/robinson.webp', alt: 'Robinson Restaurant website', width: 1600, height: 1000 },
    annotations: [],
    screens: 0,
    scroll: false,
    featured: false,
  },
];

export const FEATURED = WORK.filter((w) => w.featured);
export const EARLIER = WORK.filter((w) => !w.featured);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return WORK.find((w) => w.slug === slug);
}
