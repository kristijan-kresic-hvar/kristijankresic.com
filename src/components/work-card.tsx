import type { CSSProperties } from 'react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/content/work';

/**
 * One tile of the landing wall: a framed screen with a one-line caption, no card chrome.
 * Phones and touch screens get a small pre-cropped image. Wide screens with a pointer get the
 * full-page capture, and hover (or keyboard focus) scrolls it inside the frame, CSS only;
 * `--shot-h` tells the stylesheet how tall the frame is in container-width units.
 * No annotations here: those live on the case-study page.
 */
export function WorkCard({ study, tall = false, eager = false }: { study: CaseStudy; tall?: boolean; eager?: boolean }) {
  const base = `/images/work/${study.slug}`;
  const { props } = getImageProps({
    src: `${base}-wall.webp`,
    alt: study.image.alt,
    width: 640,
    height: 800,
    loading: eager ? 'eager' : 'lazy',
  });
  return (
    <Link href={`/work/${study.slug}/`} className="group block">
      <div
        className={`shot frame overflow-hidden rounded-md border border-border-default bg-bg-elev-1 ${tall ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}
        style={{ '--shot-h': tall ? '125cqw' : '62.5cqw' } as CSSProperties}
      >
        <picture>
          <source media="(min-width: 64rem) and (hover: hover)" srcSet={`${base}-full.webp`} />
          <img {...props} alt={study.image.alt} className="shot-scroll w-full" />
        </picture>
      </div>
      <p className="mt-2.5 text-sm text-text-muted">
        <span className="font-medium text-text-primary">{study.client}</span>
        {study.short && <span className="max-sm:block"> <span className="max-sm:hidden">· </span>{study.short}</span>}
      </p>
    </Link>
  );
}
