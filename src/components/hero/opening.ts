/** sessionStorage key that records the opening has played in this browser session. */
export const OPENING_KEY = 'hero-opening';

/** Length of the opening at full length. The CSS timeline in hero-stage.css ends inside this. */
export const OPENING_MS = 1600;

/**
 * When the opening should be over, in milliseconds since the page started loading. A page that
 * arrives late plays the same sequence faster, down to 60% of its length, to end by this.
 */
export const OPENING_DEADLINE = 1700;

/**
 * Starts the hero opening if it has not played in this session and motion is allowed.
 * It marks the hero `data-opening="play"` (the CSS does the rest), tells the CSS where the centred
 * tile sits relative to the stage, and ends at `ms` or on the first click, key or scroll by
 * setting `data-opening="done"`. Given a `deadline` (milliseconds since the page started loading)
 * it shortens the sequence to end by then, though never below 60% of its length (`--open-k` is
 * the share of full length the CSS runs at). Self-contained on purpose: it is also inlined into the page as
 * text so it runs before first paint, so it must not reference anything outside its own body.
 */
export function startOpening(key: string, ms: number, deadline?: number): void {
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
  if (plate && plate.width > 0) {
    const tile = Math.min(280, Math.max(180, innerWidth * 0.17));
    const scale = tile / plate.width;
    root.style.setProperty('--open-x', `${innerWidth / 2 - plate.left - plate.width / 2}px`);
    root.style.setProperty('--open-y', `${innerHeight / 2 - plate.top - plate.height / 2}px`);
    root.style.setProperty('--open-s', String(scale));
    root.style.setProperty('--open-h', `${(plate.height * scale) / 2}px`);
  }

  // Timed after the measuring above: on first load that forces the page's first layout, which is not quick.
  const pace = deadline === undefined ? 1 : Math.min(1, Math.max(0.6, (deadline - performance.now()) / ms));
  root.style.setProperty('--open-k', String(pace));

  const skips = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  const end = () => {
    root.dataset.opening = 'done';
    clearTimeout(timer);
    for (const type of skips) removeEventListener(type, end, true);
  };
  const timer = setTimeout(end, ms * pace);
  for (const type of skips) addEventListener(type, end, { capture: true, passive: true });
  root.dataset.opening = 'play';
}
