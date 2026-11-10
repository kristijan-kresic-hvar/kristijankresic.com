'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Annotation } from '@/content/work';

type Line = { x1: number; y1: number; x2: number; y2: number };

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Hero screenshot with numbered hotspots and pointing lines to the decision behind each one.
 * Desktop: image left, callouts right, SVG lines between them, measured from the DOM.
 * Narrow screens: hotspots on the image, numbered list below, no lines.
 * Hotspots and callouts are buttons: hover or focus either to highlight the pair.
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
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [wide, setWide] = useState(false);

  useIsoLayoutEffect(() => {
    const el = wrap.current;
    const im = img.current;
    if (!el || !im) return;

    function measure() {
      if (!el || !im) return;
      const isWide = window.matchMedia('(min-width: 1024px)').matches;
      setWide(isWide);
      if (!isWide) return setLines([]);
      const box = el.getBoundingClientRect();
      const ib = im.getBoundingClientRect();
      setLines(
        annotations.map((a, i) => {
          const lb = labels.current[i]?.getBoundingClientRect();
          return {
            x1: ib.left - box.left + (a.x / 100) * ib.width,
            y1: ib.top - box.top + (a.y / 100) * ib.height,
            x2: lb ? lb.left - box.left : ib.right - box.left,
            y2: lb ? lb.top - box.top + lb.height / 2 : ib.top - box.top,
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

  if (annotations.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-elev-1">
        <Image src={src} alt={alt} width={width} height={height} priority className="w-full" />
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] lg:gap-12">
      <div ref={img} className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elev-1">
        <Image src={src} alt={alt} width={width} height={height} priority className="w-full" />
        {annotations.map((a, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}. ${a.title}`}
            aria-describedby={`callout-${i}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 font-mono text-xs font-semibold transition-transform ${
              active === i ? 'scale-125 border-accent bg-accent text-bg-base' : 'border-accent bg-bg-base/90 text-accent'
            } h-7 w-7`}
          >
            {i + 1}
            <span
              aria-hidden="true"
              className={`absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40 motion-reduce:hidden ${active === null ? '' : 'hidden'}`}
              style={{ animationDuration: '2.4s', animationDelay: `${i * 0.4}s` }}
            />
          </button>
        ))}
      </div>

      <ol className="space-y-3 lg:space-y-5 lg:self-center">
        {annotations.map((a, i) => (
          <li key={i}>
            <button
              type="button"
              id={`callout-${i}`}
              ref={(n) => {
                labels.current[i] = n;
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                active === i ? 'border-accent bg-accent-subtle' : 'border-border-subtle bg-bg-elev-1'
              }`}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-semibold text-text-primary">{a.title}</span>
              </span>
              <span className="mt-1 block text-sm text-text-body">{a.text}</span>
            </button>
          </li>
        ))}
      </ol>

      {wide && lines.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {lines.map((l, i) => {
            const mx = l.x2 - 24;
            const d = `M ${l.x1} ${l.y1} L ${mx} ${l.y1} L ${mx} ${l.y2} L ${l.x2} ${l.y2}`;
            const on = active === i;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={on ? '#f59e0b' : '#3a3a3f'} strokeWidth={on ? 2 : 1.25} strokeDasharray={on ? undefined : '4 4'} />
                <circle cx={l.x2} cy={l.y2} r={3} fill={on ? '#f59e0b' : '#3a3a3f'} />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
