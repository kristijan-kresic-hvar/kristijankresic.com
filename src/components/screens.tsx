'use client';

import Image from 'next/image';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from '@/components/icons';

/**
 * The extra captures of a case study: one large with the rest beside it, or, for phone captures,
 * each one whole and side by side. Every capture is a plain link to its file; with JavaScript a
 * click opens it in a lightbox instead. The lightbox is a native dialog, so Escape closes it, focus
 * stays inside it and goes back to the capture that opened it.
 */
export function Screens({ title, screens, phone }: { title: string; screens: string[]; phone?: boolean | undefined }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState<number | null>(null);
  const many = screens.length > 1;

  useEffect(() => {
    if (shown === null || dialog.current?.open) return;
    dialog.current?.showModal();
    close.current?.focus();
  }, [shown]);

  function open(e: MouseEvent, i: number) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // the visitor asked for a new tab or window
    e.preventDefault();
    setShown(i);
  }
  const step = (by: number) => setShown((i) => (i === null ? i : (i + by + screens.length) % screens.length));
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <ul className="sc-grid" data-phone={phone || undefined}>
        {screens.map((s, i) => (
          <li key={s}>
            <a
              href={s}
              target="_blank"
              rel="noopener"
              onClick={(e) => open(e, i)}
              aria-label={`${title} screen ${i + 1}, view full size`}
              className="frame sc-frame"
            >
              <Image src={s} alt="" fill loading="lazy" sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover object-top" />
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${title} screens`}
        data-phone={phone || undefined}
        onClose={() => setShown(null)}
        onKeyDown={(e) => {
          if (many && e.key === 'ArrowRight') step(1);
          if (many && e.key === 'ArrowLeft') step(-1);
        }}
      >
        {shown !== null && (
          <>
            <div className="lb-bar">
              <span className="lb-count" aria-live="polite">
                {pad(shown + 1)} / {pad(screens.length)}
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
            {/* Keyed so a new capture starts at its top; a click beside the image closes. */}
            <div
              key={shown}
              className="lb-stage"
              onClick={(e) => {
                if (e.target === e.currentTarget) dialog.current?.close();
              }}
            >
              {/* Captures differ in height and are served as they are, so there is nothing for next/image to do. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screens[shown]} alt={`${title} screen ${shown + 1}`} />
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
