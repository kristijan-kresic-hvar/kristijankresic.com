/** Pixels the mouse must travel before a press on a plate counts as a drag and not a click. */
const SLOP = 6;
/** A drag this many pixels long moves on one plate, even when it stops short of halfway. */
const INTENT = 40;

/**
 * Where the rail should come to rest after a drag of `dx` pixels: the plate nearest to where it
 * was let go, or the next one in the direction of a drag that was long enough to mean it.
 */
export function restingPlace(rail: HTMLElement, dx: number): number {
  const plates = Array.from(rail.children) as HTMLElement[];
  const first = plates[0]?.offsetLeft ?? 0;
  const lean = Math.abs(dx) > INTENT ? (-Math.sign(dx) * (plates[0]?.offsetWidth ?? 0)) / 2 : 0;
  const aim = rail.scrollLeft + lean;
  return plates.map((plate) => plate.offsetLeft - first).reduce((best, stop) => (Math.abs(stop - aim) < Math.abs(best - aim) ? stop : best), 0);
}

/**
 * Lets a mouse drag the phone rail of plates sideways. A finger already scrolls it, and so do the
 * wheel and the arrow keys; a mouse on a narrow window could not pull it. Does nothing at widths
 * where the index is a list with nothing to scroll. Returns a cleanup function.
 */
export function dragRail(rail: HTMLElement): () => void {
  let from: { x: number; left: number } | null = null;
  let dragging = false;

  function down(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || rail.scrollWidth <= rail.clientWidth) return;
    from = { x: e.clientX, left: rail.scrollLeft };
  }
  function move(e: PointerEvent) {
    if (!from) return;
    const dx = e.clientX - from.x;
    if (!dragging && Math.abs(dx) < SLOP) return;
    if (!dragging) {
      dragging = true;
      rail.setPointerCapture(e.pointerId);
      rail.dataset.dragging = ''; // the CSS turns snapping off, or the rail would fight the hand
    }
    rail.scrollLeft = from.left - dx;
  }
  function up(e: PointerEvent) {
    if (!from) return;
    const dx = e.clientX - from.x;
    from = null;
    if (!dragging) return;
    rail.scrollTo({ left: restingPlace(rail, dx), behavior: 'smooth' });
    // Snapping comes back only once the rail is on a plate; turned on mid-way it would jump to the nearest one first.
    const settle = () => {
      if (!from) delete rail.dataset.dragging;
    };
    rail.addEventListener('scrollend', settle, { once: true });
    setTimeout(settle, 700); // no scrollend in older Safari, and none when the rail is already in place
    // Still true for the click that follows this release, so the drag does not open a case study.
    setTimeout(() => {
      dragging = false;
    });
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
  rail.addEventListener('dragstart', noNativeDrag);
  return () => {
    rail.removeEventListener('pointerdown', down);
    rail.removeEventListener('pointermove', move);
    rail.removeEventListener('pointerup', up);
    rail.removeEventListener('pointercancel', up);
    rail.removeEventListener('click', click, true);
    rail.removeEventListener('dragstart', noNativeDrag);
  };
}
