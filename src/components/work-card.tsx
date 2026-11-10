import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/content/work';

/**
 * One tile of the landing wall: a framed screen with a one-line caption, no card chrome.
 * Hover (or keyboard focus) scrolls the full-page capture inside the frame, CSS only; `--shot-h`
 * tells the stylesheet how tall the frame is in container-width units. No annotations here:
 * those live on the case-study page.
 */
export function WorkCard({ study, tall = false, eager = false }: { study: CaseStudy; tall?: boolean; eager?: boolean }) {
  const src = study.scroll ? `/images/work/${study.slug}-full.webp` : study.image.src.replace('.webp', '-card.webp');
  return (
    <Link href={`/work/${study.slug}/`} className="group block">
      <div
        className={`shot frame overflow-hidden rounded-md border border-border-default bg-bg-elev-1 ${tall ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}
        style={{ '--shot-h': tall ? '125cqw' : '62.5cqw' } as CSSProperties}
      >
        <Image
          src={src}
          alt={study.image.alt}
          width={800}
          height={study.scroll ? 1600 : 500}
          loading={eager ? 'eager' : 'lazy'}
          sizes="(min-width: 1024px) 28vw, 46vw"
          className={`w-full ${study.scroll ? 'shot-scroll' : 'h-full object-cover object-top'}`}
        />
      </div>
      <p className="mt-2.5 text-sm text-text-muted">
        <span className="font-medium text-text-primary">{study.client}</span>
        {study.short && <span className="max-sm:block"> <span className="max-sm:hidden">· </span>{study.short}</span>}
      </p>
    </Link>
  );
}
