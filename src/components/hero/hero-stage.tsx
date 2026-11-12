'use client';

import Link from 'next/link';
import { useRef, useState, type CSSProperties } from 'react';
import { Facts } from '@/components/facts';
import { Plate } from '@/components/plate';
import type { CaseStudy } from '@/content/work';
import { usePointer } from './use-pointer';
import './hero-variants.css';

/**
 * Hero as a stage. One project fills two thirds of the screen and runs off the right edge; the
 * index beside it switches projects with a wipe. The plate tilts toward the pointer and an amber
 * "View" disc rides with it. The stage opens like a curtain on load.
 */
export function HeroStage({ studies }: { studies: CaseStudy[] }) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(0);
  const stage = useRef<HTMLAnchorElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLSpanElement>(null);

  const pick = (i: number) => {
    if (i === active) return;
    setPrevious(active);
    setActive(i);
  };

  usePointer(stage, (p) => {
    tilt.current?.style.setProperty('--rx', p ? `${(-p.ny * 3.5).toFixed(2)}deg` : '0deg');
    tilt.current?.style.setProperty('--ry', p ? `${(p.nx * 4.5).toFixed(2)}deg` : '0deg');
    const d = disc.current;
    if (!d) return;
    d.dataset.on = p ? 'true' : 'false';
    if (p) d.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`;
  });

  const current = studies[active];

  return (
    <section className="mx-auto grid max-w-page gap-x-12 gap-y-8 overflow-x-clip px-(--gutter) pt-8 pb-16 sm:pt-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:pt-6 lg:pb-8">
      <h1 className="stage-statement hero-rise font-semibold text-text-muted lg:col-span-4 lg:row-start-1">
        <span className="text-text-primary">Frontend engineer.</span> Six client products, built inside the client&rsquo;s&nbsp;team.
      </h1>

      <Facts className="hero-rise [--rise:3] max-lg:order-2 lg:col-span-12 lg:row-start-3" />

      <ol className="stage-index max-lg:order-3 lg:col-span-4 lg:row-start-2 lg:self-end">
        {studies.map((study, i) => (
          <li key={study.slug} style={{ '--i': i } as CSSProperties}>
            <Link
              href={`/work/${study.slug}/`}
              className="stage-item"
              data-active={active === i}
              onPointerEnter={() => pick(i)}
              onFocus={() => pick(i)}
            >
              <span className="stage-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="stage-name">{study.client}</span>
              <span className="stage-short">{study.short}</span>
            </Link>
            <span className="frame mt-2 mb-5 block overflow-hidden rounded-md border border-border-default lg:hidden">
              <Plate study={study} />
            </span>
          </li>
        ))}
      </ol>

      {current && (
        <Link
          ref={stage}
          href={`/work/${current.slug}/`}
          aria-label={`${current.title}: open the case study`}
          className="stage max-lg:hidden lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1"
        >
          <div ref={tilt} className="stage-tilt">
            {studies.map((study, i) => (
              <div key={study.slug} className="stage-plate" data-state={i === active ? 'active' : i === previous ? 'previous' : 'idle'}>
                <Plate study={study} eager={i === 0} />
              </div>
            ))}
          </div>
          <span ref={disc} className="stage-disc" aria-hidden="true">
            View
          </span>
        </Link>
      )}
    </section>
  );
}
