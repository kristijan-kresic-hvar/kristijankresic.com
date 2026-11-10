'use client';

import { useEffect, useRef } from 'react';

/**
 * Dot grid that brightens amber around the pointer. Canvas, pointer-only (no touch),
 * skipped under prefers-reduced-motion, and it only draws while the pointer moves —
 * idle cost is zero. Purely decorative: aria-hidden, sits behind the hero content.
 */
export function CursorGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const GAP = 28;
    const RADIUS = 180;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let fade = 0;

    function resize() {
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (let x = GAP / 2; x < w; x += GAP) {
        for (let y = GAP / 2; y < h; y += GAP) {
          const d = Math.hypot(x - mx, y - my);
          const t = d < RADIUS ? (1 - d / RADIUS) * fade : 0;
          const r = 1 + t * 1.6;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = t > 0 ? `rgba(245,158,11,${0.12 + t * 0.75})` : 'rgba(255,255,255,0.07)';
          ctx.fill();
        }
      }
    }

    function tick() {
      raf = 0;
      draw();
      if (fade < 1 && mx > -999) {
        fade = Math.min(1, fade + 0.12);
        raf = requestAnimationFrame(tick);
      }
    }

    function onMove(e: PointerEvent) {
      if (!canvas) return;
      const b = canvas.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function onLeave() {
      mx = -9999;
      my = -9999;
      fade = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const host = canvas.parentElement ?? canvas;
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    return () => {
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
