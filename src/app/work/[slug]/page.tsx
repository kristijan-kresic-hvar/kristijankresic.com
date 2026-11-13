import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnotatedShot } from '@/components/annotated-shot';
import { Container } from '@/components/container';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@/components/icons';
import { FEATURED, WORK, getCaseStudy } from '@/content/work';

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
  const featuredIndex = FEATURED.findIndex((f) => f.slug === study.slug);
  // Featured projects are annotated on their plate, the image the hero shows, so the hero's plate lands on the same picture.
  const lead = study.featured
    ? { src: `/images/work/${study.slug}-plate.webp`, small: `/images/work/${study.slug}-plate-sm.webp`, width: 1920, height: 1200 }
    : { src: study.image.src, small: undefined, width: study.image.width, height: study.image.height };
  const screens = Array.from({ length: study.screens }, (_, i) => `/images/work/${study.slug}-screen-${i + 1}.webp`);

  return (
    <article>
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Projects" className="cs-slate">
          <Link href="/#work">
            <ArrowLeft /> All work
          </Link>
          {featuredIndex >= 0 && (
            <span>
              <span className="cs-count">
                {String(featuredIndex + 1).padStart(2, '0')} / {String(FEATURED.length).padStart(2, '0')}
              </span>
              {/* The title is below the plate on desktop, so the row names the project. */}
              <span className="ml-3 max-lg:hidden">{study.client}</span>
            </span>
          )}
          {next && (
            <Link href={`/work/${next.slug}/`}>
              Next: {next.client} <ArrowRight />
            </Link>
          )}
        </nav>
        {/* Title first in the source; from 1024px a marked-up plate is shown above it (see .cs-open). */}
        <div className="cs-open" data-marked={study.annotations.length > 0 || undefined}>
          <header className="cs-head">
            <h1 className="text-display leading-[1.04] font-semibold tracking-tighter">{study.title}</h1>
            <p className="max-w-[44ch] text-lead text-text-body">{study.tagline}</p>
          </header>
          <dl className="cs-credits">
            <div>
              <dt>Role</dt>
              <dd>{study.role}</dd>
            </div>
            <div>
              <dt>Client</dt>
              <dd>
                {study.context}, {study.location}
              </dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd className="tabular-nums">{study.period}</dd>
            </div>
            {study.url && (
              <div>
                <dt>Live</dt>
                <dd>
                  <a href={study.url} rel="noopener" className="link inline-flex items-center gap-1.5">
                    {study.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} <ArrowUpRight />
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div className="cs-shot">
            <AnnotatedShot
              src={lead.src}
              small={lead.small}
              alt={study.image.alt}
              width={lead.width}
              height={lead.height}
              annotations={study.annotations}
              morph={study.featured ? study.slug : undefined}
            />
          </div>
        </div>
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
                    src={s.replace('.webp', '-thumb.webp')}
                    alt=""
                    width={640}
                    height={400}
                    loading="lazy"
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="w-full"
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
