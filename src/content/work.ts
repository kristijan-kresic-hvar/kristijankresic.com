export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  tagline: string;
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
  featured: boolean;
};

export const WORK: CaseStudy[] = [
  {
    slug: 'biocirv',
    client: 'BioCirV',
    title: 'BioCirV Data Portal',
    tagline: 'A public biomass-discovery platform, built from scratch on Next.js 16 / React 19.',
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
    featured: true,
  },
  {
    slug: 'oncallable',
    client: 'OnCallable',
    title: 'OnCallable',
    tagline: 'A static marketing site replatformed onto a CMS-driven Sanity architecture in about two weeks.',
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
    featured: true,
  },
  {
    slug: 'suello',
    client: 'Suello',
    title: 'Suello companion app',
    tagline: 'A React Native app for a Bluetooth smart planter, built from scratch.',
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
    featured: true,
  },
  {
    slug: 'vetster',
    client: 'Vetster',
    title: 'Vetster',
    tagline: 'Vue.js features and Laravel backend work on a 24/7 pet-telehealth platform with 100k+ app users.',
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
    featured: true,
  },
  {
    slug: 'naitur',
    client: 'Naitur',
    title: 'Naitur',
    tagline: 'The frontend of a US-regulated (HIPAA) psilocybin-therapy platform.',
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
    image: { src: '/images/work/naitur.webp', alt: 'Naitur client dashboard', width: 1600, height: 1000 },
    featured: true,
  },
  {
    slug: 'buddyins',
    client: 'BuddyIns',
    title: 'BuddyIns',
    tagline: 'A Next.js frontend over a Django API with PayPal subscription payments.',
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
    image: { src: '/images/work/buddyins.webp', alt: 'BuddyIns dashboard', width: 1600, height: 1000 },
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
    featured: false,
  },
];

export const FEATURED = WORK.filter((w) => w.featured);
export const EARLIER = WORK.filter((w) => !w.featured);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return WORK.find((w) => w.slug === slug);
}
