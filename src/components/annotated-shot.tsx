'use client';

import { getImageProps } from 'next/image';
import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, ViewTransition } from 'react';
import { lookedAt, plateMorph } from '@/components/plate';
import { OPEN_LEAD } from '@/components/screens';
import type { Annotation } from '@/content/work';

type Line = { x1: number; y1: number; x2: number; y2: number; ex: number; mx: number };

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const MARKER = 14; // marker radius in px; lines start and end at the marker's edge
const noop = () => () => {};

/** Where the picture pins above its decisions: phones and tablet portrait, never under 500px tall. Mirrors `.shot-pin` in globals.css. */
export const PINNED = '(max-width: 63.99rem) and (min-height: 31.25rem)';
/** Room between whatever covers the top of the window (nav, pinned picture) and the top of a note jumped to. */
export const GAP = 8;

/**
 * The current note: the top-most one whose head (number chip and title) is whole, at or below `cover` (the
 * bottom of the pinned picture) and inside the window, or none when no head is whole. It depends only on where
 * the heads are, so the same scroll position always gives the same note, however the page got there.
 */
export function currentAt(heads: { top: number; bottom: number }[], cover: number, viewH: number): number | null {
  const i = heads.findIndex((h) => h.top >= cover - 0.5 && h.bottom <= viewH + 0.5);
  return i === -1 ? null : i;
}

/**
 * Sets `--tail` on `.shot`, so the pinned picture lets go when the last note reaches its resting place under it:
 * the grid's content box, which holds the sticky picture, ends there, and the same height comes back as padding.
 * Self-contained: it also runs inline while the page is parsed, so the picture is in its place at first paint.
 */
function setTail(shot: Element | null | undefined, gap: number) {
  const pin = shot?.querySelector('.shot-pin');
  const last = shot?.querySelector('li:last-child > .callout');
  if (!(shot instanceof HTMLElement) || !pin || !last) return;
  const tail = shot.getBoundingClientRect().bottom - last.getBoundingClientRect().top + gap - parseFloat(getComputedStyle(pin).marginBottom);
  shot.style.setProperty('--tail', `${String(tail)}px`);
}

/**
 * The part of marker `i`'s square hit area (half-size `half`) that is nearer to it than to any other marker, as a
 * polygon in px from the square's top-left corner, or null when no neighbour's square reaches into it.
 * Two close markers split the space between them along their bisector, so a tap always lands on the nearest one.
 */
export function hitArea(centres: { x: number; y: number }[], i: number, half: number): [number, number][] | null {
  const a = centres[i];
  if (!a) return null;
  let poly: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  let cut = false;
  for (const [j, b] of centres.entries()) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (j === i || Math.abs(dx) >= 2 * half || Math.abs(dy) >= 2 * half) continue;
    cut = true;
    // Clip to the half-plane nearer `a` (Sutherland-Hodgman, one edge), in coordinates centred on `a`.
    const side = ([x, y]: [number, number]) => x * dx + y * dy - (dx * dx + dy * dy) / 2;
    const next: [number, number][] = [];
    poly.forEach((p, k) => {
      const q = poly[(k + 1) % poly.length] ?? p;
      const sp = side(p);
      const sq = side(q);
      if (sp <= 0) next.push(p);
      if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
        const t = sp / (sp - sq);
        next.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
      }
    });
    poly = next;
  }
  return cut ? poly.map(([x, y]) => [x + half, y + half]) : null;
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
 * current, and while the picture is pinned the top-most note whose head is whole under it is current, and a tap
 * on a note brings it there.
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
  const titles = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [hits, setHits] = useState<(string | undefined)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  // Where the picture pins, the scroll alone picks the lit pair: hover and focus no longer light one.
  const [tracking, setTracking] = useState(false);
  const pin = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const input = useRef('');
  // A jump holds its note current until the scroll it started ends, so the rows it glides past never light.
  const held = useRef<number | null>(null);
  // Drops the last jump's hold without releasing it, so a second tap during the glide takes over.
  const unhold = useRef(() => {});
  const track = useRef(() => {});
  const pic = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  /** True only while hydrating server HTML: the inline script must not be rendered on the client. */
  const fromServer = useSyncExternalStore(
    noop,
    () => false,
    () => true,
  );

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
      // Markers close together on a narrow picture would overlap their finger-sized hit areas: split them.
      const ib0 = im.getBoundingClientRect();
      const m0 = im.querySelector<HTMLElement>('.marker');
      const half = m0 ? m0.clientWidth / 2 - parseFloat(getComputedStyle(m0, '::before').top) : 0;
      const centres = annotations.map((a) => ({ x: (a.x / 100) * ib0.width, y: (a.y / 100) * ib0.height }));
      setHits(
        annotations.map((_, i) => {
          const p = hitArea(centres, i, half);
          return p ? `polygon(${p.map(([x, y]) => `${String(x)}px ${String(y)}px`).join(', ')})` : undefined;
        }),
      );
      setTail(el, GAP);
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

  // While pinned, the top-most note whose head is whole is current: on load, on every scroll and on a resize.
  useEffect(() => {
    if (annotations.length === 0) return;
    const mq = window.matchMedia(PINNED);
    let frame = 0;
    let was = mq.matches;
    const head = (i: number) => {
      const a = labels.current[i]?.getBoundingClientRect();
      const b = titles.current[i]?.getBoundingClientRect();
      return a && b ? { top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) } : { top: Infinity, bottom: Infinity };
    };
    track.current = () => {
      frame = 0;
      setTracking(mq.matches);
      // Leaving the pinned layout (a rotation or resize) drops the pair the scroll lit.
      if (was && !mq.matches) setCurrent(null);
      was = mq.matches;
      if (!mq.matches || held.current !== null || !pin.current) return;
      setCurrent(currentAt(annotations.map((_, i) => head(i)), pin.current.getBoundingClientRect().bottom, window.innerHeight));
    };
    function later() {
      if (!frame) frame = requestAnimationFrame(track.current);
    }
    track.current();
    window.addEventListener('scroll', later, { passive: true });
    window.addEventListener('resize', later);
    return () => {
      window.removeEventListener('scroll', later);
      window.removeEventListener('resize', later);
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
    unhold.current();
    if (top === null || Math.abs(top - window.scrollY) < 1) {
      held.current = null;
      return;
    }
    held.current = i;
    const release = () => {
      unhold.current();
      held.current = null;
      track.current();
    };
    const timer = setTimeout(release, 1200); // scrollend never fires in older Safari, nor when the page cannot move
    unhold.current = () => {
      clearTimeout(timer);
      window.removeEventListener('scrollend', release);
    };
    window.addEventListener('scrollend', release);
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

  // Once something is current (a tap, or the scroll while pinned) it is the lit pair; hover and focus light it otherwise.
  const lit = tracking ? current : (current ?? active);
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
      suppressHydrationWarning
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
              style={{ left: `${a.x}%`, top: `${a.y}%`, '--i': i, '--hit': hits[i] } as CSSProperties}
              className="marker absolute z-10 -translate-x-1/2 -translate-y-1/2"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 lg:self-center">
        <h2 className="text-lg font-semibold tracking-normal">What I built here</h2>
        <p className="mt-1 text-sm text-text-muted">
          <span className="hint-mouse">Hover, tap or tab through the numbers.</span>
          <span className="hint-touch">Tap a number to go to its note.</span>
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
                  // Where the picture pins, a note tapped comes to rest under it, as a tap on its marker does.
                  if (tapped()) {
                    if (window.matchMedia(PINNED).matches) jump(i);
                    else setCurrent(i);
                  }
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
                  <span
                    ref={(n) => {
                      titles.current[i] = n;
                    }}
                    className="block font-semibold text-text-primary"
                  >
                    {a.title}
                  </span>
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
      {fromServer && (
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(${setTail.toString()})(document.currentScript.parentElement,${String(GAP)})` }} />
      )}
    </div>
  );
}
