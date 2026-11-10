import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/container';
import { Section } from '@/components/section';
import { WorkCard } from '@/components/work-card';
import { CopyButton } from '@/components/copy-button';
import { CursorGrid } from '@/components/cursor-grid';
import { LocalTime } from '@/components/local-time';
import { Ticker } from '@/components/ticker';
import { PROFILE } from '@/content/profile';
import { FEATURED, EARLIER } from '@/content/work';

const TICKER = [
  { client: 'BioCirV', built: 'Next.js 16 data portal, from scratch' },
  { client: 'OnCallable', built: 'Sanity replatform in two weeks' },
  { client: 'Suello', built: 'React Native + Bluetooth device layer' },
  { client: 'Vetster', built: 'Vue features + Laravel backend, 100k+ users' },
  { client: 'Naitur', built: 'HIPAA frontend, e-signature, magic links' },
  { client: 'BuddyIns', built: 'Next.js over Django, PayPal subscriptions' },
];

const PROCESS = [
  { n: '01', h: 'Join the team, not the ticket queue', p: 'Embedded in the client’s standups, Figma and repo from week one. Six teams, same pattern.' },
  { n: '02', h: 'Own the frontend end-to-end', p: 'Architecture, data layer, component system, forms, accessibility, performance, delivery.' },
  { n: '03', h: 'Leave a foundation', p: 'On BioCirV two other developers built on my component system while I reviewed their PRs.' },
  { n: '04', h: 'AI for the mechanical work', p: 'Claude Code and Cursor for scaffolding and research; every architecture call and merged line is mine.' },
];

export default function Home() {
  const [lead, ...rest] = FEATURED;
  return (
    <>
      {/* Hero: everything a recruiter needs above the fold, one playful layer behind it. */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <CursorGrid />
        <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:items-center lg:py-24">
          <div>
            <p className="reveal font-mono text-xs uppercase tracking-wide text-accent">Frontend engineer · available now</p>
            <h1 className="reveal reveal-delay-1 mt-4 text-[clamp(36px,4.8vw,64px)] font-semibold leading-[1.04] tracking-tighter">
              I ship the whole frontend,
              <br className="hidden sm:block" /> not just the components<span className="text-accent">.</span>
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg text-text-body">
              React · Next.js · TypeScript · React Native. {PROFILE.yearsProfessional} years shipping production web and mobile for
              North American clients: most recently a public data portal on Next.js 16 / React 19 and a Bluetooth-connected
              mobile app, both from an empty repo.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/#work"
                className="rounded-md bg-accent px-5 py-2.5 font-medium text-bg-base transition-colors hover:bg-accent-hover"
              >
                See the work
              </Link>
              <a
                href={PROFILE.cv.frontend}
                className="rounded-md border border-border-default px-5 py-2.5 font-medium text-text-primary transition-colors hover:border-accent"
              >
                CV (PDF)
              </a>
            </div>
          </div>

          {/* Recruiter card */}
          <aside
            aria-label="Contact and availability"
            className="reveal reveal-delay-2 relative rounded-2xl border border-border-default bg-bg-elev-1/90 p-5 backdrop-blur sm:p-6"
          >
            <div className="flex items-center gap-4">
              <Image
                src="/images/headshot.webp"
                alt={`Portrait of ${PROFILE.name}`}
                width={800}
                height={800}
                priority
                className="h-16 w-16 rounded-full border border-border-default"
              />
              <div>
                <p className="font-semibold text-text-primary">{PROFILE.name}</p>
                <p className="text-sm text-text-body">{PROFILE.headline} · {PROFILE.stackLine}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide text-text-muted">Status</dt>
                <dd className="mt-0.5 flex items-center gap-2 text-text-primary">
                  <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inset-0 animate-ping rounded-full motion-reduce:hidden" style={{ background: '#34d399', opacity: 0.5 }} />
                    <span className="relative inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#34d399' }} />
                  </span>
                  Available now
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide text-text-muted">Local time</dt>
                <dd className="mt-0.5 text-text-primary">
                  <LocalTime />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide text-text-muted">Based</dt>
                <dd className="mt-0.5 text-text-primary">Hvar, Croatia · EU citizen</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide text-text-muted">Works</dt>
                <dd className="mt-0.5 text-text-primary">Remote EU / US-East · hybrid Split, Zagreb</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${PROFILE.email}`}
                className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-bg-base transition-colors hover:bg-accent-hover"
              >
                Email me
              </a>
              <CopyButton value={PROFILE.email} label="Copy email" />
              <a href={PROFILE.phoneHref} className="font-mono text-xs text-text-secondary hover:text-text-primary">
                {PROFILE.phone}
              </a>
            </div>
            <div className="mt-4 flex gap-4 border-t border-border-subtle pt-4 font-mono text-xs">
              <a href={PROFILE.cv.frontend} className="text-text-secondary hover:text-text-primary">
                Frontend CV ↓
              </a>
              <a href={PROFILE.cv.fullstack} className="text-text-secondary hover:text-text-primary">
                Full-stack CV ↓
              </a>
              <a href={PROFILE.github} className="ml-auto text-text-secondary hover:text-text-primary">
                GitHub
              </a>
              <a href={PROFILE.linkedin} className="text-text-secondary hover:text-text-primary">
                LinkedIn
              </a>
            </div>
          </aside>
        </Container>
      </section>

      <Ticker items={TICKER} />

      <Section id="work" eyebrow="Selected work" title="Six client products, built inside the client's team.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lead && <WorkCard study={lead} large priority />}
          {rest.map((study, i) => (
            <WorkCard key={study.slug} study={study} priority={i < 1} />
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-text-muted">
          Hover a card to scroll the full page. Open a study for the decisions behind each screen.
        </p>
        <h3 className="mt-16 font-mono text-xs uppercase tracking-wide text-text-muted">Earlier work</h3>
        <ul className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
          {EARLIER.map((study) => (
            <li key={study.slug}>
              <Link
                href={`/work/${study.slug}/`}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between hover:text-text-primary"
              >
                <span>
                  <span className="font-medium text-text-primary">{study.title}</span>
                  <span className="text-text-muted"> · {study.tagline}</span>
                </span>
                <span className="font-mono text-xs text-text-muted">{study.period}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="How an engagement runs" title="Embedded, async, end-to-end." className="border-t border-border-subtle bg-bg-elev-1">
        <ol className="grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle md:grid-cols-4">
          {PROCESS.map((s) => (
            <li key={s.n} className="bg-bg-base p-6">
              <p className="font-mono text-xs text-accent">{s.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{s.h}</h3>
              <p className="mt-2 text-sm text-text-body">{s.p}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Stack">
          {PROFILE.stack.map((s) => (
            <li key={s} className="rounded-full border border-border-default px-3 py-1 font-mono text-xs text-text-secondary">
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <section id="contact" className="border-t border-border-subtle py-16 sm:py-24">
        <Container className="rounded-2xl border border-border-default bg-bg-elev-1 p-8 sm:p-12">
          <p className="font-mono text-xs uppercase tracking-wide text-accent">Available now</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Hiring a frontend engineer?</h2>
          <p className="mt-4 max-w-xl text-text-body">
            Remote across the EU or with US-East overlap, or hybrid in Split or Zagreb. EU citizen, no visa needed. Email is the
            fastest way to reach me; I reply the same day.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="rounded-md bg-accent px-5 py-2.5 font-medium text-bg-base transition-colors hover:bg-accent-hover"
            >
              {PROFILE.email}
            </a>
            <CopyButton value={PROFILE.email} label="Copy email" />
            <a href={PROFILE.phoneHref} className="font-mono text-sm text-text-secondary hover:text-text-primary">
              {PROFILE.phone}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
