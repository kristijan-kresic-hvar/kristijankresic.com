import { approach } from './motion';
import { contours, depthAt, dropStone, INDEX_EVERY, rgba, ringAt, SPACING, STONE, type Shoal, type Stone } from './field';

/** Pixels between grid points. Lines are straight within a cell, so this is their smoothness. */
const STEP = 18;
/** Line opacity: behind text, in open ground, on an index contour, and where a dropped stone's ring is passing. */
const ALPHA = { quiet: 0.07, open: 0.16, index: 0.3, ring: 0.5 } as const;
/** Milliseconds between frames. The chart drifts a few pixels a second, so 30 frames a second is plenty. */
const FRAME = 30;
/** Padding in pixels around the text the field keeps quiet behind. */
const PAD = 12;

type Rect = { l: number; t: number; r: number; b: number };

/**
 * Draws the depth chart behind `hero` (any positioned element) and keeps it moving while that
 * element is on screen and the tab is visible; nothing runs otherwise. Lines are dimmed behind
 * the elements `text` selects inside it. Under reduced motion or without a fine pointer it draws
 * one still frame and never animates. Returns a cleanup function.
 */
export function runField(canvas: HTMLCanvasElement, hero: HTMLElement, text: string): () => void {
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
  let stone: Stone | null = null;
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
    quiet = Array.from(hero.querySelectorAll<HTMLElement>(text), (el) => ({
      l: el.offsetLeft - PAD,
      t: el.offsetTop - PAD,
      r: el.offsetLeft + el.offsetWidth + PAD,
      b: el.offsetTop + el.offsetHeight + PAD,
    }));
    draw();
  }

  function draw() {
    if (!ctx) return;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) values[j * cols + i] = depthAt(i * STEP, j * STEP, clock, shoal, stone);
    const open = new Path2D();
    const index = new Path2D();
    const hush = new Path2D();
    const lit = new Path2D();
    const ring = stone; // the lines the ring is crossing light up, or the lean alone is too slight to notice
    const passing = (x: number, y: number) => ring !== null && ringAt(x, y, ring) > STONE.height * 0.12;
    contours(values, cols, rows, STEP, SPACING, (x1, y1, x2, y2, line) => {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      // Behind text the ring only lifts a line to the level of open ground, so the words stay easy to read.
      const path = quiet.some((q) => mx > q.l && mx < q.r && my > q.t && my < q.b)
        ? passing(mx, my)
          ? open
          : hush
        : passing(mx, my)
          ? lit
          : line % INDEX_EVERY === 0
            ? index
            : open;
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
    });
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(accent, ALPHA.quiet);
    ctx.stroke(hush);
    ctx.strokeStyle = rgba(accent, ALPHA.open);
    ctx.stroke(open);
    ctx.strokeStyle = rgba(accent, ALPHA.index);
    ctx.stroke(index);
    if (ring) {
      ctx.strokeStyle = rgba(accent, ALPHA.ring);
      ctx.stroke(lit);
    }
    if (canvas.dataset.on === undefined) canvas.dataset.on = ''; // once: the CSS fades the canvas in from here
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (last && now - last < FRAME) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : FRAME / 1000;
    last = now;
    clock += dt;
    if (aim) {
      if (shoal.amount === 0) Object.assign(shoal, aim); // the swell rises where the pointer is, it does not slide in
      // Slow on purpose: the swell trails the pointer and takes about two seconds to rise, so it never tracks the hand.
      shoal.x = approach(shoal.x, aim.x, dt, 2);
      shoal.y = approach(shoal.y, aim.y, dt, 2);
    }
    const amount = approach(shoal.amount, aim ? 1 : 0, dt, 1.5);
    shoal.amount = amount < 0.001 ? 0 : amount;
    if (stone && (stone.age += dt) >= stone.life) stone = null;
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
  /** The easter egg: resting on the name in the nav drops a stone there (see nav.tsx). The point may lie outside the chart. */
  function onStone(e: Event) {
    const at = (e as CustomEvent<{ x: number; y: number }>).detail;
    const box = hero.getBoundingClientRect();
    stone = dropStone(at.x - box.left, at.y - box.top, width, height);
  }

  const sizer = new ResizeObserver(resize);
  sizer.observe(hero);
  // The text too: it can grow without the host growing (a form message in a column shorter than its neighbour).
  for (const el of hero.querySelectorAll(text)) sizer.observe(el);
  const watcher = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? false;
    run();
  });
  if (live) {
    watcher.observe(hero);
    document.addEventListener('visibilitychange', run);
    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    addEventListener('chart-stone', onStone);
  }

  return () => {
    sizer.disconnect();
    watcher.disconnect();
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', run);
    removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    removeEventListener('chart-stone', onStone);
  };
}
