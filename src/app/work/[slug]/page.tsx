import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnotatedShot } from '@/components/annotated-shot';
import { Container } from '@/components/container';
import { WORK, getCaseStudy } from '@/content/work';
import { PROFILE } from '@/content/profile';

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

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = WORK.findIndex((w) => w.slug === study.slug);
  const next = WORK[(index + 1) % WORK.length];
  const screens = Array.from({ length: study.screens }, (_, i) => `/images/work/${study.slug}-screen-${i + 1}.webp`);

  return (
    <article>
      <Container className="py-10 sm:py-14">
        <Link href="/#work" className="font-mono text-xs uppercase tracking-wide text-text-muted hover:text-text-primary">
          ← All work
        </Link>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-accent">
              {study.client} · {study.period}
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{study.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-text-body">{study.tagline}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-1">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Role</dt>
              <dd className="mt-1 text-text-secondary">{study.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Client</dt>
              <dd className="mt-1 text-text-secondary">
                {study.context}, {study.location}
              </dd>
            </div>
            {study.url && (
              <div className="col-span-2 lg:col-span-1">
                <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Live</dt>
                <dd className="mt-1">
                  <a href={study.url} className="text-accent-text hover:underline" rel="noopener">
                    {study.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Container>

      <Container>
        {study.annotations.length > 0 && (
          <p className="mb-4 font-mono text-xs uppercase tracking-wide text-text-muted">
            Numbered: the decisions behind the screen · hover or tab through them
          </p>
        )}
        <AnnotatedShot
          src={study.image.src}
          alt={study.image.alt}
          width={study.image.width}
          height={study.image.height}
          annotations={study.annotations}
        />
      </Container>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[2fr_1fr]">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">What I built</h2>
          <p className="mt-4 text-text-body">{study.summary}</p>
          <ul className="mt-6 space-y-3">
            {study.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-text-body">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
          {study.outcome && <p className="mt-6 border-l-2 border-accent pl-4 text-text-secondary">{study.outcome}</p>}
        </div>
        <aside className="space-y-6 text-sm">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Stack</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {study.stack.map((s) => (
                <li key={s} className="rounded-full border border-border-default px-2.5 py-0.5 font-mono text-xs text-text-secondary">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Want this on your product?</p>
            <a href={`mailto:${PROFILE.email}`} className="mt-1 block text-text-primary hover:underline">
              {PROFILE.email}
            </a>
          </div>
          {next && (
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Next</p>
              <Link href={`/work/${next.slug}/`} className="mt-1 block text-text-primary hover:underline">
                {next.title} →
              </Link>
            </div>
          )}
        </aside>
      </Container>

      {screens.length > 0 && (
        <Container className="pb-16 sm:pb-24">
          <h2 className="font-mono text-xs uppercase tracking-wide text-text-muted">More screens</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {screens.map((s, i) => (
              <li key={s} className="overflow-hidden rounded-lg border border-border-subtle bg-bg-elev-1">
                <a href={s} target="_blank" rel="noopener" aria-label={`${study.title} screen ${i + 1}, opens full size`}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image src={s} alt="" width={1200} height={900} loading="lazy" className="h-full w-full object-cover object-top" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      )}
    </article>
  );
}
