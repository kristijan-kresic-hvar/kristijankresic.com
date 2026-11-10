import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

  return (
    <article>
      <Container className="py-12 sm:py-16">
        <Link href="/#work" className="font-mono text-xs uppercase tracking-wide text-text-muted hover:text-text-primary">
          ← All work
        </Link>
        <p className="mt-6 font-mono text-xs uppercase tracking-wide text-accent">
          {study.client} · {study.period}
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{study.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-text-body">{study.tagline}</p>

        <dl className="mt-8 grid gap-4 border-y border-border-subtle py-6 text-sm sm:grid-cols-4">
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
          <div className="sm:col-span-2">
            <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Stack</dt>
            <dd className="mt-1 text-text-secondary">{study.stack.join(' · ')}</dd>
          </div>
        </dl>
      </Container>

      <Container>
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-elev-1">
          <Image
            src={study.image.src}
            alt={study.image.alt}
            width={study.image.width}
            height={study.image.height}
            priority
            className="w-full"
          />
        </div>
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
          {study.outcome && (
            <p className="mt-6 border-l-2 border-accent pl-4 text-text-secondary">{study.outcome}</p>
          )}
        </div>
        <aside className="space-y-6 text-sm">
          {study.url && (
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Live</p>
              <a href={study.url} className="mt-1 block text-accent-text hover:underline" rel="noopener">
                {study.url.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Want this for your product?</p>
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
    </article>
  );
}
