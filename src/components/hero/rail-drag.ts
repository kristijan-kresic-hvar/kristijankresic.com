/** Pixels the mouse must travel before a press on a plate counts as a drag and not a click. */
const SLOP = 6;
/** A drag this many pixels long moves on to the next plate; a shorter one goes back. */
const INTENT = 40;
/** Milliseconds the rail takes to glide onto a plate after a drag. */
const GLIDE = 320;

/** A sideways wheel or trackpad gesture moves the rail once it has travelled this many pixels. */
const WHEEL_INTENT = 30;
/** With no wheel event for this long, the gesture and its inertia are over. */
const WHEEL_IDLE = 140;
/** A trackpad keeps sending inertia after the fingers lift; a swipe inside this many milliseconds of the last one is part of it. */
const WHEEL_GAP = 300;

/**
 * Scroll position of the plate `step` plates on from the one nearest to scroll position `start`
 * (-1 the one before, 0 that one, 1 the next): where the rail comes to rest. Never further than
 * one, because the rail moves one project at a time.
 */
export function restingPlace(rail: HTMLElement, start: number, step: number): number {
  const plates = Array.from(rail.children) as HTMLElement[];
  const first = plates[0]?.offsetLeft ?? 0;
  const stops = plates.map((plate) => plate.offsetLeft - first);
  const began = stops.reduce((best, stop, i) => (Math.abs(stop - start) < Math.abs((stops[best] ?? 0) - start) ? i : best), 0);
  const stop = stops[Math.min(stops.length - 1, Math.max(0, began + step))] ?? 0;
  return Math.min(stop, rail.scrollWidth - rail.clientWidth); // the last plate cannot reach the left edge
}

/**
 * Makes the phone rail of plates move one project at a time under a mouse: a drag pulls it and
 * lets it glide onto the next plate, and a sideways wheel or trackpad swipe moves it one plate
 * per gesture instead of however far the inertia runs. A finger scrolls it natively, with CSS
 * snapping. Does nothing at widths where the index is a list with nothing to scroll. Returns a
 * cleanup function.
 */
export function dragRail(rail: HTMLElement): () => void {
  let from: { x: number; left: number } | null = null;
  let dragging = false;
  let glide = 0;
  /** Where the running glide is heading, so a second step taken during it counts from there. */
  let heading = 0;

  /** Glides to `left` and only then hands the rail back to CSS snapping: turned on mid-way, snapping would jump to the nearest plate. */
  function settle(left: number) {
    cancelAnimationFrame(glide);
    rail.dataset.dragging = ''; // the CSS turns snapping off, or the rail would fight the glide
    heading = left;
    const start = rail.scrollLeft;
    const began = performance.now();
    const length = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : GLIDE;
    const frame = (now: number) => {
      // A frame's timestamp can be a little before `began`: without the floor the rail would start by backing up.
      const t = length ? Math.min(1, Math.max(0, (now - began) / length)) : 1;
      rail.scrollLeft = start + (left - start) * (1 - (1 - t) ** 3);
      if (t < 1) glide = requestAnimationFrame(frame);
      else {
        glide = 0;
        delete rail.dataset.dragging;
      }
    };
    glide = requestAnimationFrame(frame);
  }

  function down(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || rail.scrollWidth <= rail.clientWidth) return;
    from = { x: e.clientX, left: rail.scrollLeft };
    // Caught mid-glide: the rail stops under the mouse, and this press must put it back on a plate even if it never moves.
    dragging = glide !== 0;
    cancelAnimationFrame(glide);
    glide = 0;
  }
  function move(e: PointerEvent) {
    if (!from) return;
    const dx = e.clientX - from.x;
    if (!dragging && Math.abs(dx) < SLOP) return;
    dragging = true;
    rail.dataset.dragging = ''; // the CSS turns snapping off, or the rail would fight the hand
    if (!rail.hasPointerCapture(e.pointerId)) rail.setPointerCapture(e.pointerId);
    rail.scrollLeft = from.left - dx;
  }
  function up(e: PointerEvent) {
    if (!from) return;
    const { x, left } = from;
    from = null;
    if (!dragging) return;
    const dx = e.clientX - x;
    settle(restingPlace(rail, left, Math.abs(dx) > INTENT ? -Math.sign(dx) : 0));
    // Still true for the click that follows this release, so the drag does not open a case study.
    setTimeout(() => {
      dragging = false;
    });
  }
  let travelled = 0;
  let stepped = -Infinity;
  let strength = 0;
  let locked = false;
  let idle: ReturnType<typeof setTimeout> | undefined;
  function wheel(e: WheelEvent) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || rail.scrollWidth <= rail.clientWidth) return; // up and down is the page's
    e.preventDefault();
    clearTimeout(idle);
    idle = setTimeout(() => {
      locked = false;
      travelled = 0;
      strength = 0;
    }, WHEEL_IDLE);
    // Inertia only ever fades, so a clear rise in strength some time after the last step is a new swipe.
    const now = Math.abs(e.deltaX);
    const again = now > 12 && now > strength * 1.6 && e.timeStamp - stepped > WHEEL_GAP;
    strength = now;
    if (locked && !again) return;
    if (locked) travelled = 0;
    locked = false;
    travelled += e.deltaX;
    if (Math.abs(travelled) < WHEEL_INTENT) return;
    locked = true;
    stepped = e.timeStamp;
    settle(restingPlace(rail, glide ? heading : rail.scrollLeft, Math.sign(travelled)));
  }
  function click(e: MouseEvent) {
    if (!dragging) return;
    e.preventDefault();
    e.stopPropagation();
  }
  // A link starts a native drag of its own, which would cancel the pointer events.
  const noNativeDrag = (e: DragEvent) => {
    e.preventDefault();
  };

  rail.addEventListener('pointerdown', down);
  rail.addEventListener('pointermove', move);
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', up);
  rail.addEventListener('click', click, true);
  rail.addEventListener('wheel', wheel, { passive: false });
  rail.addEventListener('dragstart', noNativeDrag);
  return () => {
    cancelAnimationFrame(glide);
    clearTimeout(idle);
    rail.removeEventListener('pointerdown', down);
    rail.removeEventListener('pointermove', move);
    rail.removeEventListener('pointerup', up);
    rail.removeEventListener('pointercancel', up);
    rail.removeEventListener('click', click, true);
    rail.removeEventListener('wheel', wheel);
    rail.removeEventListener('dragstart', noNativeDrag);
  };
}
