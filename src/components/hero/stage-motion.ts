import { approach, REST, tiltFor, weightAt, WEIGHT } from './motion';

type Letter = { el: HTMLElement; x: number; y: number; weight: number };

/**
 * Runs everything in the hero that moves after the opening, on one animation frame loop that
 * stops as soon as nothing is moving: the plate leaning into the pointer with a band of light
 * across it, and the statement's letters gaining weight near the pointer. Both need a fine
 * pointer and neither runs under reduced motion. Returns the function that stops it.
 */
export function runStageMotion(stage: HTMLElement, statement: HTMLElement): (() => void) | undefined {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let raf = 0;
  let last = 0;
  /** Pointer over the plate: -1 to 1 from its centre, and percent across it. */
  let over: { nx: number; ny: number; px: number } | null = null;
  const lean: { rx: number; ry: number; lx: number; lit: number } = { ...REST };
  /** Pointer near the statement, in page coordinates. */
  let near: { x: number; y: number } | null = null;
  let letters: Letter[] = [];
  let radius = 0;

  const leanPlate = (dt: number) => {
    // Under the pointer the band follows it and brightens only a little over its rest strength: at full strength it read as a glare.
    const aim = over ? { ...tiltFor(over.nx, over.ny), lx: over.px, lit: 0.7 } : REST;
    const gap = Math.abs(aim.rx - lean.rx) + Math.abs(aim.ry - lean.ry) + Math.abs(aim.lx - lean.lx) / 20 + Math.abs(aim.lit - lean.lit);
    if (gap === 0) return false;
    if (gap < 0.01) Object.assign(lean, aim);
    else {
      lean.rx = approach(lean.rx, aim.rx, dt, 9);
      lean.ry = approach(lean.ry, aim.ry, dt, 9);
      lean.lx = approach(lean.lx, aim.lx, dt, 12);
      lean.lit = approach(lean.lit, aim.lit, dt, 7);
    }
    // On the stage, not the plate: the boards under the plate lean with it.
    stage.style.setProperty('--rx', `${lean.rx.toFixed(3)}deg`);
    stage.style.setProperty('--ry', `${lean.ry.toFixed(3)}deg`);
    stage.style.setProperty('--lx', `${lean.lx.toFixed(2)}%`);
    stage.style.setProperty('--lit', lean.lit.toFixed(3));
    return true;
  };

  function weighLetters(dt: number) {
    let moving = false;
    for (const letter of letters) {
      const target = near ? weightAt(Math.hypot(near.x - letter.x, near.y - letter.y), radius) : WEIGHT.rest;
      if (letter.weight === target) continue;
      const weight = approach(letter.weight, target, dt, 10);
      letter.weight = Math.abs(target - weight) < 1 ? target : weight;
      letter.el.style.fontWeight = letter.weight === WEIGHT.rest ? '' : letter.weight.toFixed(0);
      moving = true;
    }
    return moving;
  }

  function frame(now: number) {
    // Real elapsed time, uncapped: every motion here is exact in time, so slow frames skip ahead instead of running long.
    const dt = Math.max(0, (now - last) / 1000);
    last = now;
    const moving = [leanPlate(dt), weighLetters(dt)].some(Boolean);
    raf = moving ? requestAnimationFrame(frame) : 0;
  }
  const kick = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  /**
   * Gives every letter a fixed box as wide as its own advance at rest weight (kerning included),
   * so a heavier letter overflows its box instead of pushing its neighbours: no reflow.
   */
  function lockLetters() {
    const size = parseFloat(getComputedStyle(statement).fontSize);
    const boxes: [HTMLElement, number][] = [];
    for (const word of statement.querySelectorAll<HTMLElement>('.stage-word')) {
      const els = Array.from(word.children) as HTMLElement[];
      const edges = [...els.map((el) => el.getBoundingClientRect().left), word.getBoundingClientRect().right];
      els.forEach((el, i) => boxes.push([el, ((edges[i + 1] ?? 0) - (edges[i] ?? 0)) / size]));
    }
    for (const [el, em] of boxes) el.style.width = `${em.toFixed(4)}em`;
    statement.dataset.locked = 'true';
    radius = size * 4;
    letters = boxes.map(([el]) => ({ el, x: 0, y: 0, weight: WEIGHT.rest }));
  }

  function placeLetters() {
    radius = parseFloat(getComputedStyle(statement).fontSize) * 4;
    for (const letter of letters) {
      const box = letter.el.getBoundingClientRect();
      letter.x = box.left + box.width / 2 + scrollX;
      letter.y = box.top + box.height / 2 + scrollY;
    }
  }

  function onWindowMove(e: PointerEvent) {
    const box = statement.getBoundingClientRect();
    const inside =
      e.clientX > box.left - radius && e.clientX < box.right + radius && e.clientY > box.top - radius && e.clientY < box.bottom + radius;
    if (!inside && !near) return;
    if (inside && !near) placeLetters();
    near = inside ? { x: e.pageX, y: e.pageY } : null;
    kick();
  }
  function onWindowLeave() {
    near = null;
    kick();
  }
  function onStageMove(e: PointerEvent) {
    const box = stage.getBoundingClientRect();
    const x = (e.clientX - box.left) / box.width;
    over = { nx: x * 2 - 1, ny: ((e.clientY - box.top) / box.height) * 2 - 1, px: x * 100 };
    kick();
  }
  function onStageLeave() {
    over = null;
    kick();
  }

  let stopped = false;
  void document.fonts.ready.then(() => {
    if (!stopped) lockLetters();
  });
  addEventListener('pointermove', onWindowMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onWindowLeave);
  stage.addEventListener('pointermove', onStageMove, { passive: true });
  stage.addEventListener('pointerleave', onStageLeave);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    removeEventListener('pointermove', onWindowMove);
    document.documentElement.removeEventListener('pointerleave', onWindowLeave);
    stage.removeEventListener('pointermove', onStageMove);
    stage.removeEventListener('pointerleave', onStageLeave);
  };
}
