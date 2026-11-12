import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OPENING_KEY, OPENING_MS, OPENING_WAIT, startOpening } from './opening';

const hero = () => document.querySelector<HTMLElement>('.hero');
const state = () => hero()?.dataset.opening;
const plates = () => hero()?.dataset.plates;

/** Gives the fixture a stage on screen with one plate image that is still loading; returns how to finish or fail the load. */
function loadingPlate() {
  const tilt = document.querySelector('.stage-tilt');
  if (!tilt) throw new Error('fixture has no plate');
  vi.spyOn(tilt, 'getBoundingClientRect').mockReturnValue({ left: 500, top: 90, width: 900, height: 560 } as DOMRect);
  tilt.innerHTML = '<div class="stage-face"><img></div>';
  const img = tilt.querySelector('img');
  if (!img) throw new Error('fixture has no image');
  let settle: { loaded: () => void; failed: () => void } | undefined;
  Object.defineProperty(img, 'complete', { value: false });
  img.decode = () =>
    new Promise<void>((loaded, failed) => {
      settle = { loaded, failed: () => { failed(new Error('broken image')); } };
    });
  return { loaded: () => settle?.loaded(), failed: () => settle?.failed() };
}

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
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    expect(state()).toBe('play');
    expect(sessionStorage.getItem(OPENING_KEY)).not.toBeNull();
  });

  it('does not play again in the same session', () => {
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    vi.runAllTimers();
    document.body.innerHTML = '<section class="hero"></section>'; // back on the landing page later
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    expect(state()).toBeUndefined();
  });

  it('does not play under reduced motion, and leaves the session unmarked', () => {
    reducedMotion(true);
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    expect(state()).toBeUndefined();
    expect(sessionStorage.getItem(OPENING_KEY)).toBeNull();
  });

  it('does not play when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    expect(state()).toBeUndefined();
  });

  it('runs the full sequence at once when nothing has to load, and ends by itself', () => {
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    expect(plates()).toBe('count');
    vi.advanceTimersByTime(OPENING_MS - 1);
    expect(state()).toBe('play');
    vi.advanceTimersByTime(1);
    expect(state()).toBe('done');
    expect(plates()).toBeUndefined();
  });

  it('holds the count until the plate images are loaded, then runs it at full length', async () => {
    const plate = loadingPlate();
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    await vi.advanceTimersByTimeAsync(OPENING_WAIT - 1);
    expect([state(), plates()]).toEqual(['play', undefined]);
    plate.loaded();
    await vi.advanceTimersByTimeAsync(0);
    expect(plates()).toBe('count');
    await vi.advanceTimersByTimeAsync(OPENING_MS - 1);
    expect(state()).toBe('play');
    await vi.advanceTimersByTimeAsync(1);
    expect(state()).toBe('done');
  });

  it('skips the count when the images take too long, and does not start it if they arrive after that', async () => {
    const plate = loadingPlate();
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    await vi.advanceTimersByTimeAsync(OPENING_WAIT);
    expect(plates()).toBe('late');
    plate.loaded();
    await vi.advanceTimersByTimeAsync(0);
    expect(plates()).toBe('late');
    await vi.advanceTimersByTimeAsync(OPENING_MS / 2);
    expect(state()).toBe('done');
    expect(OPENING_WAIT + OPENING_MS / 2).toBeLessThanOrEqual(2000); // a slow connection is not kept waiting for a show it will not get
  });

  it('skips the count when a plate fails to load', async () => {
    const plate = loadingPlate();
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    plate.failed();
    await vi.advanceTimersByTimeAsync(0);
    expect(plates()).toBe('late');
  });

  it.each(['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'])('jumps to the end on %s', (type) => {
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    window.dispatchEvent(new Event(type));
    expect(state()).toBe('done');
  });

  it('does not treat pointer movement as a skip', () => {
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
    window.dispatchEvent(new Event('pointermove'));
    expect(state()).toBe('play');
  });

  it('tells the CSS where a small centred tile sits relative to the stage', () => {
    const plate = document.querySelector('.stage-tilt');
    if (!plate) throw new Error('fixture has no plate');
    vi.spyOn(plate, 'getBoundingClientRect').mockReturnValue({ left: 500, top: 90, width: 900, height: 560 } as DOMRect);
    vi.stubGlobal('innerWidth', 1440);
    vi.stubGlobal('innerHeight', 900);
    startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT);
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
    (new Function(`(${startOpening.toString()})(${JSON.stringify(OPENING_KEY)},${OPENING_MS},${OPENING_WAIT})`) as () => void)();
    expect(state()).toBe('play');
    vi.advanceTimersByTime(OPENING_MS);
    expect(state()).toBe('done');
  });
});
