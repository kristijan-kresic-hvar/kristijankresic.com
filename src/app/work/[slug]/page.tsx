import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnotatedShot } from '@/components/annotated-shot';
import { Container } from '@/components/container';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@/components/icons';
import { WORK, getCaseStudy } from '@/content/work';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.tagline,
    openGraph: { title: study.title, description: study.tagline, images: [{ url: study.image.src }] },
  };
}

const row = 'grid grid-cols-[4.5rem_1fr] gap-x-4 border-t border-border-default py-3';

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = WORK.findIndex((w) => w.slug === study.slug);
  const next = WORK[(index + 1) % WORK.length];
  const screens = Array.from({ length: study.screens }, (_, i) => `/images/work/${study.slug}-screen-${i + 1}.webp`);

  return (
    <article>
      <Container className="pt-8 sm:pt-12">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors duration-(--duration-instant) hover:text-text-primary"
        >
          <ArrowLeft /> All work
        </Link>
        <header className="mt-8 grid gap-x-12 gap-y-10 lg:mt-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 className="text-display leading-[1.04] font-semibold tracking-tighter">{study.title}</h1>
            <p className="mt-5 max-w-[44ch] text-lead text-text-body">{study.tagline}</p>
          </div>
          <dl className="text-sm lg:col-span-4">
            <div className={row}>
              <dt className="text-text-muted">Role</dt>
              <dd className="text-text-primary">{study.role}</dd>
            </div>
            <div className={row}>
              <dt className="text-text-muted">Client</dt>
              <dd className="text-text-primary">
                {study.context}, {study.location}
              </dd>
            </div>
            <div className={row}>
              <dt className="text-text-muted">Period</dt>
              <dd className="text-text-primary tabular-nums">{study.period}</dd>
            </div>
            {study.url && (
              <div className={`${row} border-b`}>
                <dt className="text-text-muted">Live</dt>
                <dd>
                  <a href={study.url} rel="noopener" className="link inline-flex items-center gap-1.5 text-text-primary">
                    {study.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} <ArrowUpRight />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </header>
      </Container>

      <Container className="mt-12 lg:mt-16">
        <AnnotatedShot
          src={study.image.src}
          alt={study.image.alt}
          width={study.image.width}
          height={study.image.height}
          annotations={study.annotations}
        />
      </Container>

      <Container className="grid gap-x-12 gap-y-8 py-20 lg:grid-cols-12 lg:py-28">
        <h2 className="text-title leading-[1.08] font-semibold lg:col-span-4">What I built</h2>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="text-lead text-text-secondary">{study.summary}</p>
          <ul className="mt-10">
            {study.highlights.map((h) => (
              <li key={h} className="border-t border-border-default py-5 text-text-body">
                {h}
              </li>
            ))}
            <li className={`${row} border-b py-5`}>
              <h3 className="text-sm font-normal tracking-normal text-text-muted">Stack</h3>
              <p className="text-text-secondary">{study.stack.join(', ')}</p>
            </li>
          </ul>
        </div>
        {study.outcome && (
          <p className="ruled mt-10 text-title leading-[1.12] font-semibold tracking-tight text-text-primary lg:col-span-10 lg:mt-16">
            {study.outcome}
          </p>
        )}
      </Container>

      {screens.length > 0 && (
        <Container className="pb-20 lg:pb-28">
          <h2 className="text-title leading-[1.08] font-semibold">More screens</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:gap-4">
            {screens.map((s, i) => (
              <li key={s} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
                <a
                  href={s}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${study.title} screen ${i + 1}, opens full size`}
                  className="frame block overflow-hidden rounded-md border border-border-default bg-bg-elev-1"
                >
                  <Image
                    src={s}
                    alt=""
                    width={1200}
                    height={750}
                    loading="lazy"
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {next && (
        <Container>
          <Link
            href={`/work/${next.slug}/`}
            className="next-study group grid items-center gap-x-12 gap-y-6 border-t border-border-default py-10 sm:grid-cols-12 lg:py-14"
          >
            <span className="sm:col-span-8">
              <span className="block text-sm text-text-muted">Next project</span>
              <span className="mt-2 flex items-baseline gap-4 text-display leading-[1.04] font-semibold tracking-tighter text-text-primary">
                {next.title}
                <ArrowRight className="size-[0.5em] shrink-0 text-accent transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-1.5 motion-reduce:transition-none" />
              </span>
            </span>
            <span className="frame block overflow-hidden rounded-md border border-border-default sm:col-span-4">
              <Image
                src={next.image.src.replace('.webp', '-card.webp')}
                alt=""
                width={800}
                height={500}
                loading="lazy"
                sizes="(min-width: 640px) 33vw, 100vw"
                className="w-full"
              />
            </span>
          </Link>
        </Container>
      )}
    </article>
  );
}
