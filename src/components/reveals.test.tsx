import { afterEach, describe, expect, it, vi } from 'vitest';
import { armReveals } from './reveals';

type Watch = (entries: { isIntersecting: boolean; target: Element }[]) => void;

/** Two blocks: one in view, one below the window (jsdom's window is 768 tall). */
function page() {
  document.body.innerHTML = '<p class="rise" id="seen"></p><p class="rise" id="below"></p>';
  const seen = document.getElementById('seen') as HTMLElement;
  const below = document.getElementById('below') as HTMLElement;
  seen.getBoundingClientRect = () => ({ top: 100 }) as DOMRect;
  below.getBoundingClientRect = () => ({ top: 2000 }) as DOMRect;
  return { seen, below };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('armReveals', () => {
  it('hides only what is below the window, shows it once it scrolls in, and shows the rest on cleanup', () => {
    let fire: Watch = () => {};
    const unobserve = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Watch) {
          fire = cb;
        }
        observe() {}
        unobserve = unobserve;
        disconnect() {}
      },
    );
    const { seen, below } = page();
    const disarm = armReveals();
    expect(seen).not.toHaveAttribute('data-wait');
    expect(below).toHaveAttribute('data-wait');

    fire([{ isIntersecting: false, target: below }]);
    expect(below).toHaveAttribute('data-wait');
    fire([{ isIntersecting: true, target: below }]);
    expect(below).not.toHaveAttribute('data-wait');
    expect(unobserve).toHaveBeenCalledWith(below);

    below.dataset.wait = '';
    disarm();
    expect(below).not.toHaveAttribute('data-wait');
  });

  it('hides nothing under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { below } = page();
    armReveals();
    expect(below).not.toHaveAttribute('data-wait');
  });
});
