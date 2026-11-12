import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OPENING_DEADLINE, OPENING_KEY, OPENING_MS, startOpening } from './opening';

const hero = () => document.querySelector<HTMLElement>('.hero');
const state = () => hero()?.dataset.opening;

function reducedMotion(on: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: on && query.includes('reduce'), media: query }) as MediaQueryList);
}

beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  document.body.innerHTML = '<section class="hero"><a class="stage"><div class="stage-tilt"></div></a></section>';
  reducedMotion(false);
});
afterEach(() => {
  vi.runAllTimers(); // lets a running opening end, which removes its listeners
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('startOpening', () => {
  it('plays on the first visit of a session and records it', () => {
    startOpening(OPENING_KEY, OPENING_MS);
    expect(state()).toBe('play');
    expect(sessionStorage.getItem(OPENING_KEY)).not.toBeNull();
  });

  it('does not play again in the same session', () => {
    startOpening(OPENING_KEY, OPENING_MS);
    vi.runAllTimers();
    document.body.innerHTML = '<section class="hero"></section>'; // back on the landing page later
    startOpening(OPENING_KEY, OPENING_MS);
    expect(state()).toBeUndefined();
  });

  it('does not play under reduced motion, and leaves the session unmarked', () => {
    reducedMotion(true);
    startOpening(OPENING_KEY, OPENING_MS);
    expect(state()).toBeUndefined();
    expect(sessionStorage.getItem(OPENING_KEY)).toBeNull();
  });

  it('does not play when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    startOpening(OPENING_KEY, OPENING_MS);
    expect(state()).toBeUndefined();
  });

  it('ends by itself inside two seconds, with room left for the page to load first', () => {
    startOpening(OPENING_KEY, OPENING_MS);
    vi.advanceTimersByTime(OPENING_MS - 1);
    expect(state()).toBe('play');
    vi.advanceTimersByTime(1);
    expect(state()).toBe('done');
    expect(OPENING_MS).toBeLessThanOrEqual(1700);
  });

  it('plays at full length when the page arrived in time to finish by the deadline', () => {
    vi.advanceTimersByTime(OPENING_DEADLINE - OPENING_MS); // the page took this long to arrive
    startOpening(OPENING_KEY, OPENING_MS, OPENING_DEADLINE);
    expect(hero()?.style.getPropertyValue('--open-k')).toBe('1');
    vi.advanceTimersByTime(OPENING_MS - 1);
    expect(state()).toBe('play');
    vi.advanceTimersByTime(1);
    expect(state()).toBe('done');
    expect(OPENING_DEADLINE).toBeLessThanOrEqual(1750); // the timer runs late on a busy main thread, so leave slack under 2000
  });

  it('plays faster on a page that arrived late, and is still over by the deadline', () => {
    vi.advanceTimersByTime(600);
    startOpening(OPENING_KEY, OPENING_MS, OPENING_DEADLINE);
    expect(Number(hero()?.style.getPropertyValue('--open-k'))).toBeCloseTo((OPENING_DEADLINE - 600) / OPENING_MS, 6);
    vi.advanceTimersByTime(OPENING_DEADLINE - 600 - 1);
    expect(state()).toBe('play');
    vi.advanceTimersByTime(1);
    expect(state()).toBe('done');
  });

  it('still plays on a page that arrived very late, at its shortest', () => {
    vi.advanceTimersByTime(3000);
    startOpening(OPENING_KEY, OPENING_MS, OPENING_DEADLINE);
    expect(hero()?.style.getPropertyValue('--open-k')).toBe('0.6');
    vi.advanceTimersByTime(OPENING_MS * 0.6 - 1);
    expect(state()).toBe('play');
    vi.advanceTimersByTime(1);
    expect(state()).toBe('done');
  });

  it.each(['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'])('jumps to the end on %s', (type) => {
    startOpening(OPENING_KEY, OPENING_MS);
    window.dispatchEvent(new Event(type));
    expect(state()).toBe('done');
  });

  it('does not treat pointer movement as a skip', () => {
    startOpening(OPENING_KEY, OPENING_MS);
    window.dispatchEvent(new Event('pointermove'));
    expect(state()).toBe('play');
  });

  it('tells the CSS where a small centred tile sits relative to the stage', () => {
    const plate = document.querySelector('.stage-tilt');
    if (!plate) throw new Error('fixture has no plate');
    vi.spyOn(plate, 'getBoundingClientRect').mockReturnValue({ left: 500, top: 90, width: 900, height: 560 } as DOMRect);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    startOpening(OPENING_KEY, OPENING_MS);
    const style = hero()?.style;
    // plate centre is (950, 370), viewport centre (720, 450); tile is 17% of the viewport wide
    expect(style?.getPropertyValue('--open-x')).toBe('-230px');
    expect(style?.getPropertyValue('--open-y')).toBe('80px');
    expect(Number(style?.getPropertyValue('--open-s'))).toBeCloseTo(244.8 / 900, 6);
    vi.unstubAllGlobals();
  });

  it('still works as the standalone text the page inlines', () => {
    // The page runs this function from its source text before React loads, so it cannot lean on imports.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- evaluating our own function source is the point of the test
    (new Function(`(${startOpening.toString()})(${JSON.stringify(OPENING_KEY)},${OPENING_MS},${OPENING_DEADLINE})`) as () => void)();
    expect(state()).toBe('play');
    vi.advanceTimersByTime(OPENING_MS);
    expect(state()).toBe('done');
  });
});
