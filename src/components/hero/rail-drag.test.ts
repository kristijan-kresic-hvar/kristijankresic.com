import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dragRail, restingPlace } from './rail-drag';

/** A rail of four plates 300px wide, 12px apart, in a 350px window: stops at 0, 312, 624 and 936. */
function rail(scrollWidth = 1300) {
  document.body.innerHTML = '<ol><li><a href="#a">A</a></li><li></li><li></li><li></li></ol>';
  const el = document.querySelector('ol');
  if (!el) throw new Error('no rail');
  Array.from(el.children).forEach((li, i) => {
    Object.defineProperty(li, 'offsetLeft', { value: 20 + i * 312 });
    Object.defineProperty(li, 'offsetWidth', { value: 300 });
  });
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth });
  Object.defineProperty(el, 'clientWidth', { value: 350 });
  el.setPointerCapture = () => {};
  el.hasPointerCapture = () => false;
  return el;
}
/** jsdom has no PointerEvent: a mouse event carrying the one extra field the rail reads stands in for it. */
const pointer = (type: string, x: number, pointerType = 'mouse') =>
  Object.assign(new MouseEvent(type, { button: 0, clientX: x, bubbles: true }), { pointerType, pointerId: 1 });
const mouse = (type: string, x: number) => pointer(type, x);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.runAllTimers();
  vi.useRealTimers();
});

describe('restingPlace', () => {
  it('rests on the plate nearest to where it began, or the one next to it', () => {
    expect(restingPlace(rail(), 300, 0)).toBe(312);
    expect(restingPlace(rail(), 300, 1)).toBe(624);
    expect(restingPlace(rail(), 300, -1)).toBe(0);
  });

  it('never rests before the first plate, and stops the last one at the end of the rail', () => {
    expect(restingPlace(rail(), 0, -1)).toBe(0);
    expect(restingPlace(rail(), 936, 1)).toBe(936);
    expect(restingPlace(rail(1250), 624, 1)).toBe(900); // 1250 wide in a 350 window: the rail ends at 900, before the last stop
  });
});

describe('dragRail', () => {
  it('scrolls the rail with the mouse, without snapping, and swallows the click that ends the drag', () => {
    const el = rail();
    dragRail(el);
    el.dispatchEvent(mouse('pointerdown', 300));
    el.dispatchEvent(mouse('pointermove', 180));
    expect(el.scrollLeft).toBe(120);
    expect(el.dataset.dragging).toBe('');
    el.dispatchEvent(mouse('pointerup', 180));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.querySelector('a')?.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    vi.runAllTimers(); // the glide: fake timers drive requestAnimationFrame too
    expect(el.scrollLeft).toBe(312);
    expect(el.dataset.dragging).toBeUndefined();
  });

  it('moves one plate for a long drag as for a short one, and back to where it began for a nudge', () => {
    const el = rail();
    dragRail(el);
    el.dispatchEvent(mouse('pointerdown', 340));
    el.dispatchEvent(mouse('pointermove', -300));
    el.dispatchEvent(mouse('pointerup', -300));
    vi.runAllTimers();
    expect(el.scrollLeft).toBe(312);
    el.dispatchEvent(mouse('pointerdown', 300));
    el.dispatchEvent(mouse('pointermove', 280));
    el.dispatchEvent(mouse('pointerup', 280));
    vi.runAllTimers();
    expect(el.scrollLeft).toBe(312);
  });

  it('moves one plate per sideways wheel gesture, inertia included, and leaves vertical wheels to the page', () => {
    const el = rail();
    dragRail(el);
    const wheel = (deltaX: number, deltaY = 0) => {
      const e = new WheelEvent('wheel', { deltaX, deltaY, bubbles: true, cancelable: true });
      el.dispatchEvent(e);
      vi.advanceTimersByTime(16);
      return e;
    };
    expect(wheel(0, 80).defaultPrevented).toBe(false);
    // one swipe: the fingers, then a long fading tail
    for (const d of [8, 20, 45, 60, 52, 40, 31, 24, 18, 13, 9, 6, 4, 2, 1]) expect(wheel(d).defaultPrevented).toBe(true);
    vi.advanceTimersByTime(600);
    expect(el.scrollLeft).toBe(312);
    // the next swipe, the other way
    for (const d of [-10, -30, -50, -30, -12, -4]) wheel(d);
    vi.advanceTimersByTime(600);
    expect(el.scrollLeft).toBe(0);
  });

  it('leaves a plain click alone', () => {
    const el = rail();
    dragRail(el);
    el.dispatchEvent(mouse('pointerdown', 300));
    el.dispatchEvent(mouse('pointerup', 302));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.querySelector('a')?.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(el.dataset.dragging).toBeUndefined();
  });

  it('ignores touch, which scrolls the rail natively, and widths where there is nothing to scroll', () => {
    const el = rail();
    dragRail(el);
    el.dispatchEvent(pointer('pointerdown', 300, 'touch'));
    el.dispatchEvent(pointer('pointermove', 100, 'touch'));
    expect(el.dataset.dragging).toBeUndefined();
    const list = rail(350);
    dragRail(list);
    list.dispatchEvent(mouse('pointerdown', 300));
    list.dispatchEvent(mouse('pointermove', 100));
    expect(list.dataset.dragging).toBeUndefined();
  });
});
