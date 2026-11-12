import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia; components gate motion and layout on it.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the DOM typings say it always exists; jsdom disagrees
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the legacy members
      addListener: () => {},
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the legacy members
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom has no canvas and logs an error when asked for one; the hero's field skips itself on null.
if (typeof window !== 'undefined') HTMLCanvasElement.prototype.getContext = () => null;
