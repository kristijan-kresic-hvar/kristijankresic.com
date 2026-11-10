'use client';

import { getImageProps } from 'next/image';
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Annotation } from '@/content/work';

type Line = { x1: number; y1: number; x2: number; y2: number; mx: number };

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const MARKER = 14; // marker radius in px; lines start and end at the marker's edge

/**
 * Hero screenshot marked up like a proof: numbered markers on the image, the decision behind each
 * one listed beside it, and a leader line joining every pair.
 * From 1024px: image left, list right, SVG lines measured from the DOM.
 * Below that: markers on the image, numbered list underneath, no lines.
 * Markers and list rows are buttons: hover or focus either one to light the pair.
 */
export function AnnotatedShot({
  src,
  alt,
  width,
  height,
  annotations,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  annotations: Annotation[];
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = wrap.current;
    const im = img.current;
    if (!el || !im) return;

    function measure() {
      if (!el || !im) return;
      if (!window.matchMedia('(min-width: 1024px)').matches) return setLines([]);
      const box = el.getBoundingClientRect();
      const ib = im.getBoundingClientRect();
      setLines(
        annotations.map((a, i) => {
          const lb = labels.current[i]?.getBoundingClientRect();
          return {
            x1: ib.left - box.left + (a.x / 100) * ib.width + MARKER,
            y1: ib.top - box.top + (a.y / 100) * ib.height,
            x2: lb ? lb.left - box.left : ib.right - box.left,
            y2: lb ? lb.top - box.top + lb.height / 2 : ib.top - box.top,
            // Each line turns in the gutter at its own x so the vertical runs never stack.
            mx: ib.right - box.left + 12 + i * 9,
          };
        }),
      );
    }

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [annotations]);

  // The LCP element on this page: fetched first, and phones get the half-size crop (same framing,
  // so the marker positions still hold).
  const { props } = getImageProps({ src, alt, width, height, loading: 'eager', fetchPriority: 'high', decoding: 'sync' });
  const frame = (
    <div className="overflow-hidden rounded-lg border border-border-default bg-bg-elev-1">
      <picture>
        <source media="(max-width: 40rem)" srcSet={src.replace('.webp', '-card.webp')} />
        <img {...props} alt={alt} className="w-full" />
      </picture>
    </div>
  );

  if (annotations.length === 0) return frame;

  const pair = (i: number) => ({
    onMouseEnter: () => setActive(i),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
    'data-active': active === i,
  });

  return (
    <div ref={wrap} className="relative grid gap-x-12 gap-y-8 lg:grid-cols-12">
      <div ref={img} className="relative self-start lg:col-span-8">
        {frame}
        {annotations.map((a, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}. ${a.title}`}
            aria-describedby={`callout-${i}`}
            {...pair(i)}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            className="marker absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="lg:col-span-4 lg:self-center">
        <h2 className="text-lg font-semibold tracking-normal">The decisions behind this screen</h2>
        <p className="mt-1 text-sm text-text-muted">Hover, tap or tab through the numbers.</p>
        <ol className="mt-5 border-b border-border-default">
          {annotations.map((a, i) => (
            <li key={i}>
              <button
                type="button"
                id={`callout-${i}`}
                {...pair(i)}
                className="callout grid w-full grid-cols-[2.5rem_1fr] border-t border-border-default py-4 text-left"
              >
                <span
                  ref={(n) => {
                    labels.current[i] = n;
                  }}
                  aria-hidden="true"
                  className="marker marker-static"
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-text-primary">{a.title}</span>
                  <span className="mt-1 block text-sm text-text-body">{a.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {lines.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" aria-hidden="true">
          {lines.map((l, i) => {
            // Real length, so the draw-in can dash the whole path without normalising it.
            const len = Math.abs(l.mx - l.x1) + Math.abs(l.y2 - l.y1) + Math.abs(l.x2 - l.mx);
            return (
              <path
                key={i}
                d={`M ${l.x1} ${l.y1} H ${l.mx} V ${l.y2} H ${l.x2}`}
                data-active={active === i}
                className="leader"
                style={{ '--i': i, '--len': len } as CSSProperties}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
