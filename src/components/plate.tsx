import { getImageProps } from 'next/image';
import type { CaseStudy } from '@/content/work';

/** A 1px transparent GIF: what a plate that is hidden at this width loads in place of its picture. */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * A project's lead image: a 16:10 plate cut from the Figma design export, the same size and crop
 * rule for every project. Phones get the 960px file. Larger screens choose between it and the
 * 1920px one by how wide the plate is drawn (`sizes`), so a plain desktop screen does not download
 * four times the pixels it can show.
 */
export function Plate({
  study,
  sizes,
  eager = false,
  priority = false,
  wideOnly = false,
  className = '',
}: {
  study: CaseStudy;
  /** How wide the plate is drawn from 768px up, as a `sizes` value. */
  sizes: string;
  eager?: boolean;
  /** Fetch ahead of the other images on the page. */
  priority?: boolean;
  /** Never shown in the phone layouts (the hero stage): there it loads nothing, so phones do not fetch six hidden plates. */
  wideOnly?: boolean;
  className?: string;
}) {
  const base = `/images/work/${study.slug}-plate`;
  const { props } = getImageProps({
    src: `${base}.webp`,
    alt: study.image?.alt ?? '',
    width: 1920,
    height: 1200,
    loading: eager ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : 'auto',
  });
  return (
    <picture>
      {wideOnly && <source media="(max-width: 39.99rem), (max-width: 63.99rem) and (max-height: 31.24rem)" srcSet={BLANK} />}
      <source media="(max-width: 48rem)" srcSet={`${base}-sm.webp`} />
      <img {...props} srcSet={`${base}-sm.webp 960w, ${base}.webp 1920w`} sizes={sizes} alt={study.image?.alt ?? ''} draggable={false} className={`block aspect-[16/10] w-full object-cover ${className}`} />
    </picture>
  );
}

/**
 * Props for the <ViewTransition> around a plate that should travel between the hero stage and the
 * case-study header: the same name on both ends pairs them, and the class is styled in globals.css.
 */
export const plateMorph = (slug: string) => ({ name: `plate-${slug}`, share: 'plate-morph', default: 'none' }) as const;

/**
 * The featured project the visitor last looked at in this page load, chosen in the hero or opened
 * as a case study ('' before either). The hero opens on it, so coming back from any case study its
 * plate has a place to travel to, not only the first one.
 */
let looked = '';
export const lastLookedAt = () => looked;
export function lookedAt(slug: string) {
  looked = slug;
}
