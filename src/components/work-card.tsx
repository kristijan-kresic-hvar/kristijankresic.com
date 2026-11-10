import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/content/work';

export function WorkCard({ study, priority = false }: { study: CaseStudy; priority?: boolean }) {
  const cardSrc = study.image.src.replace('.webp', '-card.webp');
  return (
    <Link
      href={`/work/${study.slug}/`}
      className="group block overflow-hidden rounded-xl border border-border-subtle bg-bg-elev-1 transition-colors hover:border-border-strong"
      aria-label={`${study.title}: ${study.tagline}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-bg-elev-2">
        <Image
          src={cardSrc}
          alt={study.image.alt}
          width={800}
          height={500}
          priority={priority}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
          {study.client} · {study.period}
        </p>
        <h3 className="mt-2 text-lg font-semibold">{study.title}</h3>
        <p className="mt-1 text-sm text-text-body">{study.tagline}</p>
        <p className="mt-4 font-mono text-xs text-text-muted">{study.stack.slice(0, 4).join(' · ')}</p>
      </div>
    </Link>
  );
}
