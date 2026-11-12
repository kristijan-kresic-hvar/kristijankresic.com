import { approach } from './motion';
import { contours, depthAt, INDEX_EVERY, rgba, SPACING, type Shoal } from './field';

/** Pixels between grid points. Lines are straight within a cell, so this is their smoothness. */
const STEP = 18;
/** Line opacity: behind text, in open ground, on an index contour, and the most it reaches right at the pointer. */
const ALPHA = { quiet: 0.1, open: 0.28, index: 0.5, peak: 0.6 } as const;
/** Milliseconds between frames. The chart drifts a few pixels a second, so 30 frames a second is plenty. */
const FRAME = 30;
/** Radius in pixels of the brighter patch around the pointer. */
const GLOW = 240;
/** Text the field keeps quiet behind, padded by `PAD` pixels. */
const TEXT = '.stage-statement, .stage-index, .hero-facts';
const PAD = 12;

type Rect = { l: number; t: number; r: number; b: number };

/**
 * Draws the depth chart behind the hero and keeps it moving while the hero is on screen and the
 * tab is visible; nothing runs otherwise. Under reduced motion or without a fine pointer it draws
 * one still frame and never animates. The CSS hides the canvas until the first frame and while
 * the opening plays, then fades it in. Returns a cleanup function.
 */
export function runField(canvas: HTMLCanvasElement, hero: HTMLElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const live = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent') || '#f59e0b';

  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let values = new Float32Array(0);
  let quiet: Rect[] = [];
  const shoal: Shoal = { x: 0, y: 0, amount: 0 };
  let aim: { x: number; y: number } | null = null;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let onScreen = false;

  function resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(width / STEP) + 1;
    rows = Math.ceil(height / STEP) + 1;
    values = new Float32Array(cols * rows);
    // Layout boxes, not client rects: the opening may have the text moved or scaled right now.
    quiet = Array.from(hero.querySelectorAll<HTMLElement>(TEXT), (el) => ({
      l: el.offsetLeft - PAD,
      t: el.offsetTop - PAD,
      r: el.offsetLeft + el.offsetWidth + PAD,
      b: el.offsetTop + el.offsetHeight + PAD,
    }));
    draw();
  }

  function draw() {
    if (!ctx) return;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) values[j * cols + i] = depthAt(i * STEP, j * STEP, clock, shoal);
    const open = new Path2D();
    const index = new Path2D();
    const hush = new Path2D();
    contours(values, cols, rows, STEP, SPACING, (x1, y1, x2, y2, line) => {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const path = quiet.some((q) => mx > q.l && mx < q.r && my > q.t && my < q.b) ? hush : line % INDEX_EVERY === 0 ? index : open;
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
    });
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(accent, ALPHA.quiet);
    ctx.stroke(hush);
    if (shoal.amount > 0.001) {
      const glow = ctx.createRadialGradient(shoal.x, shoal.y, 0, shoal.x, shoal.y, GLOW);
      glow.addColorStop(0, rgba(accent, ALPHA.open + (ALPHA.peak - ALPHA.open) * shoal.amount));
      glow.addColorStop(1, rgba(accent, ALPHA.open));
      ctx.strokeStyle = glow;
    } else ctx.strokeStyle = rgba(accent, ALPHA.open);
    ctx.stroke(open);
    ctx.strokeStyle = rgba(accent, ALPHA.index);
    ctx.stroke(index);
    if (canvas.dataset.on === undefined) canvas.dataset.on = ''; // once: the CSS fades the canvas in from here
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (last && now - last < FRAME) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : FRAME / 1000;
    last = now;
    clock += dt;
    if (aim) {
      if (shoal.amount === 0) Object.assign(shoal, aim); // the shoal rises where the pointer is, it does not slide in
      shoal.x = approach(shoal.x, aim.x, dt, 5);
      shoal.y = approach(shoal.y, aim.y, dt, 5);
    }
    const amount = approach(shoal.amount, aim ? 1 : 0, dt, 3);
    shoal.amount = amount < 0.001 ? 0 : amount;
    draw();
  }

  function run() {
    const go = live && onScreen && !document.hidden;
    if (go && !raf) raf = requestAnimationFrame(frame);
    if (!go && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    }
  }

  function onMove(e: PointerEvent) {
    const box = hero.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    aim = x >= 0 && y >= 0 && x <= box.width && y <= box.height ? { x, y } : null;
  }
  function onLeave() {
    aim = null;
  }

  const sizer = new ResizeObserver(resize);
  sizer.observe(hero);
  const watcher = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    run();
  });
  if (live) {
    watcher.observe(hero);
    document.addEventListener('visibilitychange', run);
    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }

  return () => {
    sizer.disconnect();
    watcher.disconnect();
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', run);
    removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
  };
}
