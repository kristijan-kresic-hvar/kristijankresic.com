import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/container';
import { HeroStage } from '@/components/hero/hero-stage';
import { ArrowRight } from '@/components/icons';
import { PROFILE } from '@/content/profile';
import { FEATURED, EARLIER } from '@/content/work';

// How an engagement runs: what happens, then the evidence for it.
const PRACTICE = [
  { h: 'Inside the team', p: 'Embedded in the client’s standups, Figma and repo from week one. Six teams, same pattern.' },
  { h: 'The whole frontend', p: 'Architecture, data layer, component system, forms, accessibility, performance, delivery.' },
  { h: 'A foundation that stays', p: 'On BioCirV two other developers built on my component system while I reviewed their PRs.' },
  { h: 'AI for the mechanical work', p: 'Claude Code and Cursor for scaffolding and research; every architecture call and merged line is mine.' },
];

const STACK = [
  { label: 'Frontend', items: PROFILE.stack.slice(0, 6) },
  { label: 'Mobile, backend, CMS', items: PROFILE.stack.slice(6, 11) },
  { label: 'Testing and delivery', items: PROFILE.stack.slice(11) },
];

const row = 'grid gap-x-8 gap-y-1 border-t border-border-default py-4 sm:grid-cols-[13rem_1fr]';

export default function Home() {
  return (
    <>
      <HeroStage studies={FEATURED} />

      <section id="work" aria-labelledby="earlier-title" className="scroll-mt-20 border-t border-border-subtle py-16 lg:py-20">
        <Container>
          <h2 id="earlier-title" className="text-2xl font-semibold">Earlier work</h2>
          <ul className="mt-6 border-b border-border-default">
            {EARLIER.map((study) => (
              <li key={study.slug}>
                <Link
                  href={`/work/${study.slug}/`}
                  className="earlier group grid gap-x-12 gap-y-1 border-t border-border-default py-4 sm:grid-cols-12 sm:items-baseline"
                >
                  <span className="font-medium text-text-primary sm:col-span-4">{study.title}</span>
                  <span className="text-text-body sm:col-span-5 lg:col-span-6">{study.tagline}</span>
                  <span className="text-sm whitespace-nowrap text-text-muted tabular-nums sm:col-span-3 sm:text-right lg:col-span-2">{study.period}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="practice-title" className="py-20 lg:py-32">
        <Container className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <figure className="max-w-56 lg:col-span-3 lg:max-w-none">
            <Image
              src="/images/headshot.webp"
              alt={`Portrait of ${PROFILE.name}`}
              width={800}
              height={800}
              loading="lazy"
              sizes="(min-width: 1024px) 22vw, 224px"
              className="portrait aspect-[4/5] w-full rounded-md object-cover"
            />
            <figcaption className="mt-2.5 text-sm text-text-muted">{PROFILE.name}, Hvar</figcaption>
          </figure>
          <div className="lg:col-span-8 lg:col-start-5">
            <h2 id="practice-title" className="ruled text-title leading-[1.1] font-semibold tracking-tight text-text-muted">
              <span className="text-text-primary">
                I join the client&rsquo;s team, own the frontend end to end and leave a foundation other people build on.
              </span>{' '}
              Six teams so far, across insurance, HIPAA healthcare, telehealth and IoT.
            </h2>
            <dl className="mt-12 lg:mt-16">
              {PRACTICE.map((s) => (
                <div key={s.h} className={row}>
                  <dt className="font-medium text-text-primary">{s.h}</dt>
                  <dd className="max-w-[60ch] text-text-body">{s.p}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-12 text-lg font-semibold tracking-normal lg:mt-16">Stack</h3>
            <dl className="mt-4 border-b border-border-default">
              {STACK.map((g) => (
                <div key={g.label} className={row}>
                  <dt className="text-text-muted">{g.label}</dt>
                  <dd className="text-text-secondary">{g.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
            <Link href="/about/" className="link mt-8 inline-flex items-center gap-2 text-text-primary">
              More about me <ArrowRight />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
