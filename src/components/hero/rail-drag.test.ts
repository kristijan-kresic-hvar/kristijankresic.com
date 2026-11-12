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
  el.setPointerCapture = vi.fn();
  const scrollTo = vi.fn();
  el.scrollTo = scrollTo;
  return Object.assign(el, { scrolledTo: scrollTo });
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
  it('goes back to the plate it left after a short drag', () => {
    const el = rail();
    el.scrollLeft = 30;
    expect(restingPlace(el, -30)).toBe(0);
  });

  it('moves on one plate after a drag long enough to mean it, in either direction', () => {
    const el = rail();
    el.scrollLeft = 100;
    expect(restingPlace(el, -100)).toBe(312);
    el.scrollLeft = 532;
    expect(restingPlace(el, 92)).toBe(312);
  });

  it('never rests before the first plate or past the last', () => {
    const el = rail();
    el.scrollLeft = 0;
    expect(restingPlace(el, 200)).toBe(0);
    el.scrollLeft = 1000;
    expect(restingPlace(el, -200)).toBe(936);
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
    expect(el.scrolledTo).toHaveBeenCalledWith({ left: 312, behavior: 'smooth' });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.querySelector('a')?.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    vi.runAllTimers();
    expect(el.dataset.dragging).toBeUndefined();
  });

  it('leaves a plain click alone', () => {
    const el = rail();
    dragRail(el);
    el.dispatchEvent(mouse('pointerdown', 300));
    el.dispatchEvent(mouse('pointerup', 302));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.querySelector('a')?.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(el.scrolledTo).not.toHaveBeenCalled();
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
