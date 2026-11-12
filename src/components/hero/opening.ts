/** sessionStorage key that records the opening has played in this browser session. */
export const OPENING_KEY = 'hero-opening';

/** Length of the opening. The CSS timeline in hero-stage.css ends inside this. */
export const OPENING_MS = 1900;

/**
 * Starts the hero opening if it has not played in this session and motion is allowed.
 * It marks the hero `data-opening="play"` (the CSS does the rest), tells the CSS where the centred
 * tile sits relative to the stage, and ends at `ms` or on the first click, key or scroll by
 * setting `data-opening="done"`. Self-contained on purpose: it is also inlined into the page as
 * text so it runs before first paint, so it must not reference anything outside its own body.
 */
export function startOpening(key: string, ms: number): void {
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

  const skips = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  const end = () => {
    root.dataset.opening = 'done';
    clearTimeout(timer);
    for (const type of skips) removeEventListener(type, end, true);
  };
  const timer = setTimeout(end, ms);
  for (const type of skips) addEventListener(type, end, { capture: true, passive: true });
  root.dataset.opening = 'play';
}
