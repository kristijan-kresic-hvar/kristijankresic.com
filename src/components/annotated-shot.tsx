'use client';

import { getImageProps } from 'next/image';
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState, ViewTransition } from 'react';
import { lookedAt, plateMorph } from '@/components/plate';
import { OPEN_LEAD } from '@/components/screens';
import type { Annotation } from '@/content/work';

type Line = { x1: number; y1: number; x2: number; y2: number; ex: number; mx: number };

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const MARKER = 14; // marker radius in px; lines start and end at the marker's edge

/** Where the picture pins above its decisions: phones and tablet portrait, never under 500px tall. Mirrors `.shot-pin` in globals.css. */
export const PINNED = '(max-width: 63.99rem) and (min-height: 31.25rem)';
/** The reading line sits this far below the pinned picture; a decision jumped to lands above it, at `GAP`. */
export const READ = 32;
/** Room between whatever covers the top of the window (nav, pinned picture) and a decision jumped to. */
export const GAP = 8;

/**
 * The decision being read: the last one whose top has passed the reading line, or none before the first.
 * Given the bottom of what covers the window, the next one takes over as soon as the current one's heading
 * slides under it, so a tall decision on a small phone is not read with its heading hidden.
 * Both boundaries only move one way as the page scrolls, so scrolling never lights two and never flickers.
 */
export function currentAt(tops: number[], line: number, cover?: number): number | null {
  const last = tops.findLastIndex((t) => t <= line);
  const at = last === -1 ? null : last;
  if (at === null || cover === undefined || (tops[at] ?? 0) >= cover) return at;
  const shown = tops.findIndex((t) => t >= cover);
  return shown === -1 ? at : shown;
}

/**
 * Where to scroll so a decision sits just below what covers the window, or null when it is already in full view
 * and nothing is pinned. Pinned, it always moves to the same place, so `currentAt` then picks that one.
 */
export function jumpTo(row: { top: number; bottom: number }, o: { scrollY: number; cover: number; viewH: number; pinned: boolean }): number | null {
  const want = o.cover + GAP;
  if (!o.pinned && row.top >= want && row.bottom <= o.viewH) return null;
  return o.scrollY + row.top - want;
}

/**
 * Hero screenshot marked up like a proof: numbered markers on the image, the decision behind each
 * one listed beside it, and a leader line from the image's edge, at the marker's height, to its decision.
 * From 1024px: image left, list right, SVG lines measured from the DOM.
 * Below that: markers on the image, numbered list underneath, no lines.
 * Markers and list rows are buttons: hover or focus either one to light the pair.
 * Touch (and anything under 1024px): a marker jumps to its decision and makes it current, a decision makes itself
 * current, and while the picture is pinned the decision at the reading line is current.
 */
export function AnnotatedShot({
  src,
  small,
  alt,
  width,
  height,
  annotations: given,
  morph,
}: {
  src: string;
  /** The half-size file phones get. Defaults to the `-card` crop beside `src`. */
  small?: string | undefined;
  alt: string;
  width: number;
  height: number;
  annotations: Annotation[];
  /** Project slug, when this image is where the hero's plate lands (see `plateMorph`). */
  morph?: string | undefined;
}) {
  // Numbered top to bottom on the image, so the lines to the list never cross whatever order the content lists them in.
  const annotations = useMemo(() => [...given].sort((a, b) => a.y - b.y), [given]);
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const pin = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const input = useRef('');
  // A jump holds its decision current until the scroll it started ends, so the rows it glides past never light.
  const held = useRef<number | null>(null);
  const pic = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  // Tell the hero which project to open on when the visitor goes back.
  useEffect(() => {
    if (morph) lookedAt(morph);
  }, [morph]);

  // Markers wait for the picture: numbers on an empty frame point at nothing. A failed image still releases them.
  useEffect(() => {
    let on = true;
    void new Promise<void>((resolve) => {
      resolve(pic.current?.decode());
    })
      .catch(() => {})
      .then(() => {
        if (on) setReady(true);
      });
    return () => {
      on = false;
    };
  }, []);

  useIsoLayoutEffect(() => {
    const el = wrap.current;
    const im = img.current;
    if (!el || !im) return;

    function measure() {
      if (!el || !im) return;
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        setLines([]);
        return;
      }
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
            ex: ib.right - box.left,
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

  // While pinned, the decision at the reading line is current.
  useEffect(() => {
    if (annotations.length === 0) return;
    const mq = window.matchMedia(PINNED);
    let frame = 0;
    function track() {
      frame = 0;
      if (!mq.matches || held.current !== null || !pin.current) return;
      const cover = pin.current.getBoundingClientRect().bottom;
      setCurrent(currentAt(rows.current.map((r) => r?.getBoundingClientRect().top ?? Infinity), cover + READ, cover));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(track);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [annotations]);

  // A tap, a pen or anything under 1024px; a mouse or a key on the desktop layout keeps the desktop's behaviour.
  function tapped() {
    const by = input.current;
    input.current = '';
    return by === 'touch' || by === 'pen' || !window.matchMedia('(min-width: 64rem)').matches;
  }

  function jump(i: number) {
    const row = rows.current[i];
    if (!row) return;
    setCurrent(i);
    row.focus({ preventScroll: true });
    const pinned = window.matchMedia(PINNED).matches;
    const nav = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = jumpTo(row.getBoundingClientRect(), {
      scrollY: window.scrollY,
      cover: nav + (pinned && pin.current ? pin.current.offsetHeight : 0),
      viewH: window.innerHeight,
      pinned,
    });
    if (top === null) return;
    held.current = i;
    const release = () => {
      held.current = null;
      window.removeEventListener('scrollend', release);
    };
    window.addEventListener('scrollend', release);
    setTimeout(release, 1200); // scrollend never fires when the page is already there, or in older Safari
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: still ? 'instant' : 'smooth' });
  }

  // The LCP element on this page: fetched first, and phones get the half-size crop (same framing,
  // so the marker positions still hold). Wider screens take that file too when it covers the width
  // the picture is drawn at (a plain desktop screen), and the full one otherwise.
  const { props } = getImageProps({ src, alt, width, height, loading: 'eager', fetchPriority: 'high', decoding: 'sync' });
  const half = small ?? src.replace('.webp', '-card.webp');
  const picture = (
    <div className="overflow-hidden rounded-lg border border-border-default bg-bg-elev-1">
      <picture>
        <source media="(max-width: 40rem)" srcSet={half} />
        <img
          {...props}
          srcSet={`${half} ${String(small ? 960 : 800)}w, ${src} ${String(width)}w`}
          sizes="(min-width: 64rem) 62vw, 94vw"
          ref={pic}
          alt={alt}
          className="w-full"
        />
      </picture>
    </div>
  );
  const morphed = morph ? <ViewTransition {...plateMorph(morph)}>{picture}</ViewTransition> : picture;
  // The picture is a link to its file; with a lightbox on the page a click opens it there. Markers are siblings, so a tap on one never lands here.
  const frame = (
    <a
      href={src}
      target="_blank"
      rel="noopener"
      aria-label={`${alt}, view full size`}
      className="lead-open block"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!window.dispatchEvent(new Event(OPEN_LEAD, { cancelable: true }))) e.preventDefault();
      }}
    >
      {morphed}
    </a>
  );

  if (annotations.length === 0) return frame;

  // Once something is current (a tap, or the reading line) it is the lit pair; hover and focus light it otherwise.
  const lit = current ?? active;
  const pair = (i: number) => ({
    // Pointer events, so the mouse events a tap fakes never leave a pair lit.
    onPointerEnter: (e: { pointerType: string }) => {
      if (e.pointerType === 'mouse') setActive(i);
    },
    onPointerLeave: (e: { pointerType: string }) => {
      if (e.pointerType === 'mouse') setActive(null);
    },
    onPointerDown: (e: { pointerType: string }) => {
      input.current = e.pointerType;
    },
    onFocus: () => setActive(i),
    onBlur: () => setActive(null),
    'data-active': lit === i,
  });

  return (
    <div
      ref={wrap}
      data-ready={ready || undefined}
      style={{ '--ratio': width / height } as CSSProperties}
      className="shot relative grid gap-x-12 gap-y-8 lg:grid-cols-12"
    >
      <div ref={pin} className="shot-pin self-start lg:col-span-8">
        <div ref={img} className="relative">
          {frame}
          {annotations.map((a, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}. ${a.title}`}
              aria-describedby={`callout-${i}`}
              {...pair(i)}
              onClick={() => {
                if (tapped()) jump(i);
              }}
              style={{ left: `${a.x}%`, top: `${a.y}%`, '--i': i } as CSSProperties}
              className="marker absolute z-10 -translate-x-1/2 -translate-y-1/2"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 lg:self-center">
        <h2 className="text-lg font-semibold tracking-normal">The decisions behind this screen</h2>
        <p className="mt-1 text-sm text-text-muted">
          <span className="hint-mouse">Hover, tap or tab through the numbers.</span>
          <span className="hint-touch">Tap a number to go to its decision.</span>
        </p>
        <ol className="mt-5">
          {annotations.map((a, i) => (
            <li key={i}>
              <button
                type="button"
                id={`callout-${i}`}
                ref={(n) => {
                  rows.current[i] = n;
                }}
                {...pair(i)}
                onClick={() => {
                  if (tapped()) setCurrent(i);
                }}
                aria-current={current === i || undefined}
                className="callout grid w-full grid-cols-[2.5rem_1fr] py-4 text-left"
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
                  <span className="callout-text mt-1 block text-sm text-text-body">{a.text}</span>
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
            const len = Math.abs(l.mx - l.ex) + Math.abs(l.y2 - l.y1) + Math.abs(l.x2 - l.mx);
            return (
              <g key={i} data-active={lit === i}>
                {/* Across the screenshot only while the pair is lit, so no line sits on the UI it explains. */}
                <path d={`M ${l.x1} ${l.y1} H ${l.ex}`} className="leader leader-across" />
                <path
                  d={`M ${l.ex} ${l.y1} H ${l.mx} V ${l.y2} H ${l.x2}`}
                  className="leader leader-gutter"
                  style={{ '--i': i, '--len': len } as CSSProperties}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
