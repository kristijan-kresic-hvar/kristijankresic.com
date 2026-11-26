'use client';

import Image from 'next/image';
import { type CSSProperties, type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from '@/components/icons';

/** The window event the lead picture sends to open the lightbox on itself. Cancelled when a lightbox took it. */
export const OPEN_LEAD = 'lightbox:lead';

/** Which picture the track shows, from its scroll position: the nearest whole slide. */
export function slideAt(scrollLeft: number, width: number, count: number): number {
  if (width <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / width)));
}

/** How far a tap zooms: at least 2x the fitted picture, up to its own pixels, never past 3x. */
export function zoomFactor(fitWidth: number, naturalWidth: number): number {
  return Math.max(2, Math.min(3, naturalWidth / fitWidth));
}

/**
 * Where to scroll a zoomed slide so the spot that was tapped stays under the finger.
 * `fx`/`fy` are the tap's place on the picture (0 to 1), `px`/`py` its place in the slide's window.
 */
export function zoomScroll(o: { fx: number; fy: number; width: number; height: number; px: number; py: number }) {
  return { left: o.fx * o.width - o.px, top: o.fy * o.height - o.py };
}

type Zoom = { i: number; width: number; left: number; top: number };

/**
 * The extra captures of a case study: one large with the rest beside it (two or four sit in rows of two), or, for phone captures,
 * each one whole and side by side. Every capture is a plain link to its file; with JavaScript a
 * click opens it in a lightbox instead. The lightbox is a native dialog, so Escape closes it, focus
 * stays inside it and goes back to the capture that opened it. Its pictures sit on one horizontal
 * scroll-snap track, so a swipe changes picture with the browser's own physics; the lead picture,
 * when given, is the first of them. A tap on a picture zooms it for panning, another tap fits it again.
 */
export function Screens({
  title,
  screens,
  phone,
  lead,
}: {
  title: string;
  /** Each capture's file and the alt text that says what it shows. A label names one that is not of the product itself. */
  screens: { src: string; alt: string; label?: string | undefined }[];
  phone?: boolean | undefined;
  /** The case study's lead picture, opened by a tap on it (see `OPEN_LEAD`). */
  lead?: { src: string; alt: string } | undefined;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const pictures = [...(lead ? [{ src: lead.src, alt: lead.alt }] : []), ...screens];
  const first = lead ? 1 : 0;
  const many = pictures.length > 1;

  useEffect(() => {
    if (shown === null || dialog.current?.open) return;
    dialog.current?.showModal();
    close.current?.focus();
    const t = track.current;
    if (t) t.scrollLeft = shown * t.clientWidth;
  }, [shown]);

  useEffect(() => {
    if (!lead) return;
    const take = (e: Event) => {
      e.preventDefault();
      setShown(0);
    };
    window.addEventListener(OPEN_LEAD, take);
    return () => window.removeEventListener(OPEN_LEAD, take);
  }, [lead]);

  // The zoomed slide scrolls to the tapped spot once it has its new size.
  useLayoutEffect(() => {
    if (!zoom) return;
    track.current?.children[zoom.i]?.scrollTo({ left: zoom.left, top: zoom.top, behavior: 'instant' });
  }, [zoom]);

  function open(e: MouseEvent, i: number) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // the visitor asked for a new tab or window
    e.preventDefault();
    setShown(i + first);
  }
  function go(i: number) {
    setShown(i);
    setZoom(null);
    const t = track.current;
    // A wrap cuts straight to the other end: gliding back would run the counter through every picture between.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(i - (shown ?? i)) > 1;
    t?.scrollTo({ left: i * t.clientWidth, behavior: still ? 'instant' : 'smooth' });
  }
  const step = (by: number) => {
    if (shown !== null) go((shown + by + pictures.length) % pictures.length);
  };
  function toggleZoom(e: MouseEvent<HTMLImageElement>, i: number) {
    if (zoom) {
      setZoom(null);
      return;
    }
    const img = e.currentTarget;
    const box = img.getBoundingClientRect();
    const view = (img.parentElement as HTMLElement).getBoundingClientRect();
    const width = box.width * zoomFactor(box.width, img.naturalWidth || box.width);
    const fx = (e.clientX - box.left) / box.width;
    const fy = (e.clientY - box.top) / box.height;
    setZoom({ i, width, ...zoomScroll({ fx, fy, width, height: (width / box.width) * box.height, px: e.clientX - view.left, py: e.clientY - view.top }) });
  }
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <ul className="sc-grid" data-phone={phone || undefined} data-pair={screens.length === 2 || screens.length === 4 || undefined}>
        {screens.map((s, i) => (
          <li key={s.src} className="rise">
            <a
              href={s.src}
              target="_blank"
              rel="noopener"
              onClick={(e) => open(e, i)}
              aria-label={`${s.alt}, view full size`}
              className="frame sc-frame"
            >
              <Image src={s.src} alt="" fill loading="lazy" sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover object-top" />
              {s.label && <span className="sc-label">{s.label}</span>}
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${title} screens`}
        data-phone={phone || undefined}
        onClose={() => {
          setShown(null);
          setZoom(null);
        }}
        onKeyDown={(e) => {
          if (many && e.key === 'ArrowRight') step(1);
          if (many && e.key === 'ArrowLeft') step(-1);
        }}
      >
        {shown !== null && (
          <>
            <div className="lb-bar">
              <span className="lb-count" aria-live="polite">
                <span className="sr-only">
                  Screen {shown + 1} of {pictures.length}
                </span>
                <span aria-hidden="true">
                  {pad(shown + 1)} / {pad(pictures.length)}
                </span>
              </span>
              {many && (
                <button type="button" className="lb-btn" aria-label="Previous screen" onClick={() => step(-1)}>
                  <ArrowLeft />
                </button>
              )}
              {many && (
                <button type="button" className="lb-btn" aria-label="Next screen" onClick={() => step(1)}>
                  <ArrowRight />
                </button>
              )}
              <button ref={close} type="button" className="lb-btn" onClick={() => dialog.current?.close()}>
                Close
              </button>
            </div>
            <div
              ref={track}
              className="lb-track"
              onScroll={(e) => {
                const at = slideAt(e.currentTarget.scrollLeft, e.currentTarget.clientWidth, pictures.length);
                if (at === shown) return;
                setShown(at);
                setZoom(null);
              }}
            >
              {pictures.map((p, i) => (
                // A click beside the image closes.
                <div
                  key={p.src}
                  className="lb-stage"
                  data-zoom={zoom?.i === i || undefined}
                  style={zoom?.i === i ? ({ '--zw': `${String(zoom.width)}px` } as CSSProperties) : undefined}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) dialog.current?.close();
                  }}
                >
                  {/* Captures differ in height and are served as they are, so there is nothing for next/image to do. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} loading={i === shown ? 'eager' : 'lazy'} onClick={(e) => toggleZoom(e, i)} />
                </div>
              ))}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
