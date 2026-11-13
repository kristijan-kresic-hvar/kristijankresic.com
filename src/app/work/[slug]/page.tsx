import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { AnnotatedShot } from '@/components/annotated-shot';
import { Container } from '@/components/container';
import { ContourField } from '@/components/contour-field';
import { Plate, plateMorph } from '@/components/plate';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@/components/icons';
import { Screens } from '@/components/screens';
import { EARLIER, FEATURED, WORK, getCaseStudy, hasPlate } from '@/content/work';

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
    openGraph: { title: study.title, description: study.tagline, ...(study.image ? { images: [{ url: study.image.src }] } : {}) },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = WORK.findIndex((w) => w.slug === study.slug);
  const next = WORK[(index + 1) % WORK.length];
  // Two sets, as on the landing: the six in the hero, numbered as the hero numbers them, and the earlier work.
  const set = study.featured ? FEATURED : EARLIER;
  const place = set.findIndex((w) => w.slug === study.slug);
  // The lead picture is the plate where there is one (featured projects are annotated on it, so the hero's plate
  // lands on the same picture), else the plain screenshot, and nothing while a study has no real screenshot.
  const shot = study.image;
  const lead = !shot
    ? null
    : hasPlate(study)
      ? { src: `/images/work/${study.slug}-plate.webp`, small: `/images/work/${study.slug}-plate-sm.webp`, width: 1920, height: 1200, alt: shot.alt }
      : { src: shot.src, small: undefined, width: shot.width, height: shot.height, alt: shot.alt };
  const screens = Array.from({ length: study.screens }, (_, i) => `/images/work/${study.slug}-screen-${i + 1}.webp`);

  return (
    <article className="from-top">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Projects" className="cs-slate">
          <Link href="/#work">
            <ArrowLeft /> All work
          </Link>
          <span>
            {!study.featured && <span className="mr-3 max-sm:hidden">Earlier work</span>}
            <span className="cs-count">
              {String(place + 1).padStart(2, '0')} / {String(set.length).padStart(2, '0')}
            </span>
            {/* A featured title is below the plate on desktop, so the row names the project. */}
            {study.featured && <span className="ml-3 max-lg:hidden">{study.client}</span>}
          </span>
          {next && (
            <Link href={`/work/${next.slug}/`}>
              {/* On a phone the name would push the row onto two lines. */}
              <span>
                Next<span className="max-sm:hidden">: {next.title}</span>
              </span>
              <ArrowRight />
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
                  <a href={study.url} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5">
                    {study.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} <ArrowUpRight />
                  </a>
                </dd>
              </div>
            )}
          </dl>
          {lead && (
            <div className="cs-shot">
              <AnnotatedShot
                src={lead.src}
                small={lead.small}
                alt={lead.alt}
                width={lead.width}
                height={lead.height}
                annotations={study.annotations}
                morph={study.slug}
              />
            </div>
          )}
        </div>
      </Container>

      <Container className="py-20 lg:py-28">
        <div className="cs-built">
          <div className="cs-side rise">
            <h2 className="text-title leading-[1.08] font-semibold">What I built</h2>
            <p>{study.summary}</p>
            <dl>
              <dt>Stack</dt>
              <dd>{study.stack.join(', ')}</dd>
            </dl>
          </div>
          <ol className="cs-proof">
            {study.highlights.map((h, i) => (
              <li key={h} className="rise">
                <span className="cs-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {h}
              </li>
            ))}
          </ol>
        </div>
        {/* Outside the grid above: the pinned column must stop with the highlights, not slide over this. */}
        {study.outcome && (
          <p className="ruled rise mt-16 max-w-[26ch] text-title leading-[1.12] font-semibold tracking-tight text-text-primary lg:mt-20">
            {study.outcome}
          </p>
        )}
      </Container>

      {screens.length > 0 && (
        <Container className="pb-20 lg:pb-28">
          <h2 className="rise text-title leading-[1.08] font-semibold">More screens</h2>
          <Screens title={study.title} screens={screens} phone={study.phone} />
        </Container>
      )}

      {next && (
        <Container>
          <Link href={`/work/${next.slug}/`} className="cs-next rise">
            <span>
              <span className="cs-next-label">Next project</span>
              <span className="cs-next-title">
                {/* Word by word, so the arrow's track is whatever room is left after the last word, on its line. */}
                {next.title.split(' ').map((word, i) => (
                  <span key={i}>{word} </span>
                ))}
                {/* On hover the arrow runs from the name to the plate, its shaft drawing out behind it. */}
                <span className="cs-go" aria-hidden="true">
                  <span>
                    <i />
                    <ArrowRight />
                  </span>
                </span>
              </span>
              <span className="cs-next-tag">{next.tagline}</span>
            </span>
            {/* The same picture the next page opens on, so a click carries it there. */}
            {next.image ? (
              <span className="cs-next-plate">
                <ViewTransition {...plateMorph(next.slug)}>
                  {hasPlate(next) ? (
                    <Plate study={next} />
                  ) : (
                    <Image src={next.image.src.replace('.webp', '-card.webp')} alt="" width={800} height={500} loading="lazy" className="w-full" />
                  )}
                </ViewTransition>
              </span>
            ) : (
              // No screenshot exists: a plate of the site's own depth chart in its place, labelled as such. Never a mock screen.
              <span className="cs-next-plate cs-chart">
                <ContourField className="cs-chart-field" text=".cs-chart-note" />
                <span className="cs-chart-note">
                  <span>{next.period}</span>
                  <span>{next.stack.join(' · ')}</span>
                  <b>No public screenshots</b>
                </span>
              </span>
            )}
          </Link>
        </Container>
      )}
    </article>
  );
}
