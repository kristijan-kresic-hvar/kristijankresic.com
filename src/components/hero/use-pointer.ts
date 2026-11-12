'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Calls `onMove` with the pointer position inside `ref`'s element, as -1..1 from its centre and in
 * pixels from its top-left, eased toward the pointer each frame. Fine pointers only, and never
 * under prefers-reduced-motion. `onMove(null)` fires when the pointer leaves.
 */
export function usePointer(
  ref: RefObject<HTMLElement | null>,
  onMove: (p: { nx: number; ny: number; x: number; y: number } | null) => void,
  ease = 0.14,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let inside = false;
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let seeded = false;

    function frame() {
      raf = 0;
      if (!el || !inside) return;
      now.x += (target.x - now.x) * ease;
      now.y += (target.y - now.y) * ease;
      const b = el.getBoundingClientRect();
      onMove({ x: now.x, y: now.y, nx: (now.x / b.width) * 2 - 1, ny: (now.y / b.height) * 2 - 1 });
      if (Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.3) raf = requestAnimationFrame(frame);
    }
    function move(e: PointerEvent) {
      if (!el) return;
      const b = el.getBoundingClientRect();
      target.x = e.clientX - b.left;
      target.y = e.clientY - b.top;
      if (!seeded) {
        now.x = target.x;
        now.y = target.y;
        seeded = true;
      }
      inside = true;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    function leave() {
      inside = false;
      seeded = false;
      onMove(null);
    }
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers read refs; subscribing once is the point
  }, []);
}
