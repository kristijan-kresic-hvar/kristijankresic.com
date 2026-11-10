import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from './icons';
import type { CaseStudy } from '@/content/work';

/**
 * One row of the work index, laid out like a strip on a proof sheet: who and what on the left,
 * the study's inner screens as numbered frames on the right. The whole strip is one link.
 */
export function WorkStrip({ study, index }: { study: CaseStudy; index: number }) {
  const n = String(index + 1).padStart(2, '0');
  const frames = Array.from({ length: study.screens }, (_, i) => `/images/work/${study.slug}-screen-${i + 1}-thumb.webp`);
  return (
    <Link
      href={`/work/${study.slug}/`}
      className="group grid gap-x-12 gap-y-6 border-t border-border-default py-8 lg:grid-cols-12 lg:py-10"
    >
      <div className="lg:col-span-4">
        <h3 className="flex items-center gap-3 text-2xl font-semibold sm:text-[1.75rem]">
          {study.title}
          <ArrowRight className="strip-arrow shrink-0 text-accent" />
        </h3>
        <p className="mt-2 max-w-[42ch] text-text-body">{study.tagline}</p>
        <p className="mt-4 text-sm text-text-muted">
          <span className="tabular-nums">{study.period}</span> · {study.role}
        </p>
        <p className="mt-1 text-sm text-text-muted">{study.stack.slice(0, 4).join(', ')}</p>
      </div>
      <ol className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3 lg:col-span-8 lg:gap-x-4" aria-hidden="true">
        {frames.map((src, i) => (
          <li key={src} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
            <div className="frame overflow-hidden rounded-sm border border-border-default bg-bg-elev-1">
              <Image src={src} alt="" width={640} height={400} loading="lazy" sizes="(min-width: 1024px) 21vw, (min-width: 640px) 31vw, 92vw" className="w-full" />
            </div>
            <span className={`mt-1.5 block font-mono text-xs ${i === 0 ? 'text-accent' : 'text-text-muted'}`}>
              {n}
              {'ABC'[i]}
            </span>
          </li>
        ))}
      </ol>
    </Link>
  );
}
