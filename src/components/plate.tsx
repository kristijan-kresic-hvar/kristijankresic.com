import { getImageProps } from 'next/image';
import type { CaseStudy } from '@/content/work';

/**
 * A project's lead image: a 16:10 plate cut from the Figma design export, the same size and crop
 * rule for every project. Phones get the 960px file, larger screens the 1920px one.
 */
export function Plate({ study, eager = false, className = '' }: { study: CaseStudy; eager?: boolean; className?: string }) {
  const base = `/images/work/${study.slug}-plate`;
  const { props } = getImageProps({ src: `${base}.webp`, alt: study.image.alt, width: 1920, height: 1200, loading: eager ? 'eager' : 'lazy' });
  return (
    <picture>
      <source media="(max-width: 48rem)" srcSet={`${base}-sm.webp`} />
      <img {...props} alt={study.image.alt} draggable={false} className={`block aspect-[16/10] w-full object-cover ${className}`} />
    </picture>
  );
}
