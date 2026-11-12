/** sessionStorage key that records the opening has played in this browser session. */
export const OPENING_KEY = 'hero-opening';

/** Length of the plate sequence (count, then the tile growing into the stage). The CSS timeline in hero-stage.css ends inside this. */
export const OPENING_MS = 1600;

/**
 * How long the plate sequence may wait for its six images. The opening only plays on a first
 * visit, so they are never cached: on a slow connection the count would run on an empty tile.
 */
export const OPENING_WAIT = 1000;

/**
 * Starts the hero opening if it has not played in this session and motion is allowed.
 * It marks the hero `data-opening="play"`, which sets the statement word by word and holds the
 * rest of the hero back, and tells the CSS where the centred tile sits relative to the stage.
 * Then one of two things brings the rest in, marked by `data-plates`:
 *   "count"  the plate images are loaded (or there is no stage at this width): the full sequence
 *            runs for `ms`, always at full speed
 *   "late"   they were not loaded within `wait`: no count, the rest just rises in over half of `ms`
 * It ends by setting `data-opening="done"`, at once on the first click, key or scroll.
 * Self-contained on purpose: it is also inlined into the page as text so it runs before first
 * paint, so it must not reference anything outside its own body.
 */
export function startOpening(key: string, ms: number, wait: number): void {
  const root = document.querySelector<HTMLElement>('.hero');
  if (!root) return;
  try {
    if (sessionStorage.getItem(key) !== null) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    sessionStorage.setItem(key, '1');
  } catch {
    return; // storage blocked: skip the opening, never replay it on every visit
  }

  const plate = root.querySelector('.stage-tilt')?.getBoundingClientRect();
  const staged = plate !== undefined && plate.width > 0;
  if (staged) {
    const tile = Math.min(280, Math.max(180, innerWidth * 0.17));
    const scale = tile / plate.width;
    root.style.setProperty('--open-x', `${innerWidth / 2 - plate.left - plate.width / 2}px`);
    root.style.setProperty('--open-y', `${innerHeight / 2 - plate.top - plate.height / 2}px`);
    root.style.setProperty('--open-s', String(scale));
    root.style.setProperty('--open-h', `${(plate.height * scale) / 2}px`);
  }

  const skips = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const end = () => {
    root.dataset.opening = 'done';
    delete root.dataset.plates;
    clearTimeout(timer);
    for (const type of skips) removeEventListener(type, end, true);
  };
  const arrive = (how: 'count' | 'late') => {
    if (root.dataset.opening !== 'play' || root.dataset.plates !== undefined) return;
    root.dataset.plates = how;
    clearTimeout(timer);
    timer = setTimeout(end, how === 'count' ? ms : ms / 2);
  };
  for (const type of skips) addEventListener(type, end, { capture: true, passive: true });
  root.dataset.opening = 'play';

  const images = staged ? Array.from(root.querySelectorAll<HTMLImageElement>('.stage-face img')) : [];
  if (images.every((img) => img.complete && img.naturalWidth > 0)) {
    arrive('count'); // in the same task, so a page with its images cached never paints the held state
    return;
  }
  timer = setTimeout(() => {
    arrive('late');
  }, wait);
  void Promise.all(images.map((img) => img.decode())).then(
    () => {
      arrive('count');
    },
    () => {
      arrive('late'); // a plate failed to load
    },
  );
}
