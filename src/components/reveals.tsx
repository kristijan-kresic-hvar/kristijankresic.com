'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Pixels a block must be inside the window before it is revealed. Small enough that the last block on a page gets there. */
const INSIDE = 64;
/** Milliseconds between blocks that arrive together, so a row comes in one after another. */
const STAGGER = 90;

/**
 * Hides every `.rise` block that is still below the window and reveals each one once, when it
 * has scrolled a little way in (the fade and rise are CSS, on `[data-wait]`). Blocks already in
 * view, or passed, are left alone, so nothing visible ever blinks. Nothing is hidden unless this
 * ran and is watching it: without scripts, or under reduced motion, the page is simply there.
 * Only for sections with no motion of their own: the hero, the practice paragraph and the ending
 * have theirs and take none. Returns a cleanup that shows whatever is still waiting.
 */
export function armReveals(): () => void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const watcher = new IntersectionObserver(
    (entries) => {
      let together = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.transitionDelay = `${together++ * STAGGER}ms`;
        delete el.dataset.wait;
        watcher.unobserve(el);
      }
      // Blocks jumped past (End key, a long flick) are shown where they are, out of sight: scrolling
      // back up must not meet them rising against the direction of travel.
      for (const el of document.querySelectorAll<HTMLElement>('.rise[data-wait]')) {
        if (el.getBoundingClientRect().bottom > 0) continue;
        delete el.dataset.wait;
        watcher.unobserve(el);
      }
    },
    { rootMargin: `0px 0px -${INSIDE}px 0px` },
  );
  for (const el of document.querySelectorAll<HTMLElement>('.rise')) {
    if (el.getBoundingClientRect().top < innerHeight) continue;
    el.dataset.wait = '';
    watcher.observe(el);
  }
  return () => {
    watcher.disconnect();
    for (const el of document.querySelectorAll<HTMLElement>('.rise[data-wait]')) delete el.dataset.wait;
  };
}

/** Arms the reveals for the page that is up, again after each navigation. Renders nothing. */
export function Reveals() {
  const path = usePathname();
  useEffect(() => {
    let disarm = () => {};
    // A frame later: by then the router has scrolled the new page into place, and nothing has painted yet.
    const frame = requestAnimationFrame(() => {
      disarm = armReveals();
    });
    return () => {
      cancelAnimationFrame(frame);
      disarm();
    };
  }, [path]);
  return null;
}
