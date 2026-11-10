import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/content/work';

/**
 * Work card. Hover scrolls the full-page capture inside the frame (CSS only, container-query units,
 * disabled under reduced motion); no annotations here — those live on the case-study page.
 */
export function WorkCard({ study, large = false, priority = false }: { study: CaseStudy; large?: boolean; priority?: boolean }) {
  const src = study.scroll ? `/images/work/${study.slug}-full.webp` : study.image.src.replace('.webp', '-card.webp');
  return (
    <Link
      href={`/work/${study.slug}/`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-elev-1 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong motion-reduce:hover:translate-y-0 ${
        large ? 'sm:col-span-2' : ''
      }`}
      aria-label={`${study.title}: ${study.tagline}`}
    >
      <div className="shot relative aspect-[16/10] overflow-hidden border-b border-border-subtle bg-bg-elev-2">
        <Image
          src={src}
          alt={study.image.alt}
          width={800}
          height={study.scroll ? 2400 : 500}
          priority={priority}
          sizes={large ? '(min-width: 1024px) 760px, 100vw' : '(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw'}
          className={`w-full ${study.scroll ? 'shot-scroll' : 'h-full object-cover object-top'}`}
        />
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-border-default bg-bg-base/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-text-muted opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:hidden">
          {study.scroll ? 'hover to scroll' : ''}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
          {study.client} · {study.period}
        </p>
        <h3 className={`mt-2 font-semibold ${large ? 'text-2xl' : 'text-lg'}`}>{study.title}</h3>
        <p className="mt-1 text-sm text-text-body">{study.tagline}</p>
        <p className="mt-auto pt-4 font-mono text-xs text-text-muted">{study.stack.slice(0, 4).join(' · ')}</p>
      </div>
    </Link>
  );
}
