import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/container';
import { Section } from '@/components/section';
import { WorkCard } from '@/components/work-card';
import { CopyButton } from '@/components/copy-button';
import { PROFILE } from '@/content/profile';
import { FEATURED, EARLIER } from '@/content/work';

const PROOF = [
  { value: `${PROFILE.yearsProfessional} yrs`, label: 'professional, building for the web since ' + PROFILE.since },
  { value: '6', label: 'North American client products shipped at Agilno' },
  { value: '100k+', label: 'app users on the telehealth platform I shipped features for' },
  { value: 'Now', label: 'available — remote EU or hybrid Split / Zagreb' },
];

export default function Home() {
  return (
    <>
      <section className="grid-lines relative overflow-hidden border-b border-border-subtle">
        <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="reveal font-mono text-xs uppercase tracking-wide text-text-muted">
              {PROFILE.location} · EU citizen · {PROFILE.availability.split(' · ')[0]}
            </p>
            <h1 className="reveal reveal-delay-1 mt-4 text-display font-semibold leading-[1.02] tracking-tighter">
              Frontend engineer
              <br />
              <span className="text-text-secondary">
                React · Next.js · TypeScript<span className="text-accent">.</span>
              </span>
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg text-text-body">
              I ship production web and mobile products end-to-end: architecture, data layer, component system, forms,
              accessibility, performance and delivery. Most recently a public data portal on Next.js 16 / React 19 and a
              React Native app with a Bluetooth device layer.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${PROFILE.email}`}
                className="rounded-md bg-accent px-5 py-2.5 font-medium text-bg-base transition-colors hover:bg-accent-hover"
              >
                Email me
              </a>
              <a
                href={PROFILE.cv.frontend}
                className="rounded-md border border-border-default px-5 py-2.5 font-medium text-text-primary transition-colors hover:border-accent"
              >
                Download CV
              </a>
              <CopyButton value={PROFILE.email} label="Copy email" />
            </div>
          </div>
          <div className="reveal reveal-delay-2 relative mx-auto w-56 sm:w-64 lg:w-full lg:max-w-xs">
            <div className="absolute -inset-3 rounded-full bg-accent-glow blur-2xl" aria-hidden="true" />
            <Image
              src="/images/headshot.webp"
              alt={`Portrait of ${PROFILE.name}`}
              width={800}
              height={800}
              priority
              className="relative rounded-full border border-border-default"
            />
          </div>
        </Container>
      </section>

      <section aria-label="Proof points" className="border-b border-border-subtle bg-bg-elev-1">
        <Container className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF.map((p) => (
            <div key={p.label}>
              <p className="text-3xl font-semibold text-text-primary">{p.value}</p>
              <p className="mt-1 text-sm text-text-muted">{p.label}</p>
            </div>
          ))}
        </Container>
      </section>

      <Section id="work" eyebrow="Selected work" title="Six client products, built inside the client's team.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((study, i) => (
            <WorkCard key={study.slug} study={study} priority={i < 3} />
          ))}
        </div>
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

      <Section eyebrow="How I work" title="Embedded, async, end-to-end." className="border-t border-border-subtle bg-bg-elev-1">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              h: 'Own the frontend, not a ticket',
              p: 'Architecture, data layer, component system, forms and delivery. On BioCirV I set the foundation two other developers built on and reviewed their PRs.',
            },
            {
              h: 'Figma to production without a hand-off gap',
              p: 'I work directly with designers and ship the real thing: responsive, accessible, measured with Lighthouse and Core Web Vitals.',
            },
            {
              h: 'AI for the mechanical work, judgement stays mine',
              p: 'Claude Code and Cursor for scaffolding, research and review. Architecture, security decisions and every merged line are my own.',
            },
          ].map((item) => (
            <div key={item.h} className="rounded-xl border border-border-subtle bg-bg-base p-6">
              <h3 className="text-lg font-semibold">{item.h}</h3>
              <p className="mt-2 text-sm text-text-body">{item.p}</p>
            </div>
          ))}
        </div>
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
            fastest way to reach me.
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
