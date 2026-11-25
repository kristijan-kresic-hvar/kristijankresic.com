import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnnotatedShot, currentAt, GAP, hitArea, jumpTo } from './annotated-shot';
import { OPEN_LEAD } from './screens';

const annotations = [
  { x: 10, y: 20, title: 'Search', text: 'Debounced autocomplete.' },
  { x: 60, y: 70, title: 'Filters', text: 'URL state.' },
];

describe('AnnotatedShot', () => {
  it('renders a numbered hotspot and a callout for every annotation, linked for assistive tech', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    const hotspot = screen.getByRole('button', { name: '1. Search' });
    expect(hotspot).toHaveAttribute('aria-describedby', 'callout-0');
    expect(screen.getByText('Debounced autocomplete.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Filters' })).toBeInTheDocument();
  });

  it('highlights the pair when a callout is focused', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    const callout = document.getElementById('callout-1') as HTMLElement;
    fireEvent.focus(callout);
    expect(callout).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: '2. Filters' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: '1. Search' })).toHaveAttribute('data-active', 'false');
    fireEvent.blur(callout);
    expect(callout).toHaveAttribute('data-active', 'false');
  });

  it('falls back to a plain image with no annotations', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={[]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('img', { name: 'shot' })).toBeInTheDocument();
  });
});

describe('currentAt (the top-most whole head)', () => {
  const cover = 300;
  const viewH = 844;
  // Heads 28px tall at these tops.
  const at = (...tops: number[]) => tops.map((top) => ({ top, bottom: top + 28 }));
  it('lights nothing while no head is whole: all under the picture, or the first still below the window', () => {
    expect(currentAt(at(-200, 100, 250), cover, viewH)).toBeNull();
    expect(currentAt(at(830, 950), cover, viewH)).toBeNull();
  });
  it('lights the first note once its head is whole inside the window', () => {
    expect(currentAt(at(viewH - 28, 950), cover, viewH)).toBe(0);
    expect(currentAt(at(400, 520), cover, viewH)).toBe(0);
  });
  it('keeps a note lit while its head is whole, even with its text under the picture', () => {
    expect(currentAt(at(cover, cover + 170), cover, viewH)).toBe(0);
  });
  it('hands over to the next note as soon as the head slides under the picture, never back', () => {
    expect(currentAt(at(cover - 1, cover + 169), cover, viewH)).toBe(1);
    expect(currentAt(at(cover - 120, cover + 50), cover, viewH)).toBe(1);
  });
  it('judges the whole head, so a title wrapping onto a second line must be in the window too', () => {
    expect(currentAt([{ top: 800, bottom: 860 }], cover, viewH)).toBeNull();
    expect(currentAt([{ top: 780, bottom: 840 }], cover, viewH)).toBe(0);
  });
  it('lights a note jumped to (its row top at GAP under the picture, its head 17px lower), not the one before', () => {
    const head = cover + GAP + 17;
    expect(currentAt(at(head - 120, head, head + 120), cover, viewH)).toBe(1);
    // A few pixels of scroll after the jump keep it.
    expect(currentAt(at(head - 124, head - 4, head + 116), cover, viewH)).toBe(1);
  });
  it('gives the same answer for the same heads, whichever way the page scrolled to get there', () => {
    const heads = at(cover - 40, cover + 60, cover + 180);
    expect(currentAt(heads, cover, viewH)).toBe(currentAt([...heads], cover, viewH));
    expect(currentAt(heads, cover, viewH)).toBe(1);
  });
});

describe('jumpTo', () => {
  const o = { scrollY: 1000, cover: 57, viewH: 844, pinned: false };
  it('leaves a decision alone when it is already in full view and nothing is pinned', () => {
    expect(jumpTo({ top: 200, bottom: 320 }, o)).toBeNull();
  });
  it('brings a decision below the nav when it is under it or below the window', () => {
    expect(jumpTo({ top: 20, bottom: 140 }, o)).toBe(1000 + 20 - 57 - GAP);
    expect(jumpTo({ top: 800, bottom: 920 }, o)).toBe(1000 + 800 - 57 - GAP);
  });
  it('with the picture pinned, always lands the decision just under the picture', () => {
    const pinned = { ...o, cover: 57 + 243, pinned: true };
    expect(jumpTo({ top: 400, bottom: 520 }, pinned)).toBe(1000 + 400 - 300 - GAP);
  });
});

describe('AnnotatedShot on touch and narrow screens', () => {
  it('tapping a marker makes its decision current, lights the pair and moves focus there', () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    fireEvent.click(screen.getByRole('button', { name: '2. Filters' }));
    const callout = document.getElementById('callout-1') as HTMLElement;
    expect(callout).toHaveAttribute('aria-current', 'true');
    expect(callout).toHaveFocus();
    expect(screen.getByRole('button', { name: '2. Filters' })).toHaveAttribute('data-active', 'true');
    expect(document.getElementById('callout-0')).not.toHaveAttribute('aria-current');
    expect(scroll).toHaveBeenCalledOnce();
    scroll.mockRestore();
  });

  it('where the picture does not pin, tapping a note makes it and its marker current, one at a time', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    const [first, second] = [document.getElementById('callout-0'), document.getElementById('callout-1')] as HTMLElement[];
    fireEvent.click(first as HTMLElement);
    fireEvent.click(second as HTMLElement);
    expect(second).toHaveAttribute('aria-current', 'true');
    expect(first).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: '2. Filters' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: '1. Search' })).toHaveAttribute('data-active', 'false');
  });

  it('has a helper line for touch that does not mention hover', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    expect(document.querySelector('.hint-touch')?.textContent).not.toMatch(/hover/i);
    expect(document.querySelector('.hint-mouse')).toHaveTextContent('Hover, tap or tab through the numbers.');
  });
});

describe('tapping the lead picture', () => {
  it('asks the lightbox to open on a tap on the picture, and never on a tap on a marker', () => {
    const asked = vi.fn((e: Event) => {
      e.preventDefault();
    });
    window.addEventListener(OPEN_LEAD, asked);
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={annotations} />);
    fireEvent.click(screen.getByRole('button', { name: '1. Search' }));
    expect(asked).not.toHaveBeenCalled();
    const link = screen.getByRole('link', { name: 'shot, view full size' });
    expect(link).toHaveAttribute('href', '/x.webp');
    expect(fireEvent.click(screen.getByRole('img', { name: 'shot' }))).toBe(false); // the lightbox took it
    expect(asked).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_LEAD, asked);
  });

  it('stays a plain link to the file with no lightbox, or when the visitor asks for a new tab', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={[]} />);
    const link = screen.getByRole('link', { name: 'shot, view full size' });
    expect(fireEvent.click(link)).toBe(true);
    const asked = vi.fn((e: Event) => {
      e.preventDefault();
    });
    window.addEventListener(OPEN_LEAD, asked);
    expect(fireEvent.click(link, { metaKey: true })).toBe(true);
    expect(asked).not.toHaveBeenCalled();
    window.removeEventListener(OPEN_LEAD, asked);
  });
});

describe('hitArea (markers close together)', () => {
  it('leaves a marker with no neighbour in reach its whole square', () => {
    expect(hitArea([{ x: 0, y: 0 }, { x: 100, y: 0 }], 0, 24)).toBeNull();
  });

  it('splits two neighbours along the line halfway between them', () => {
    const centres = [{ x: 0, y: 0 }, { x: 30, y: 0 }];
    expect(hitArea(centres, 0, 24)).toEqual([[0, 0], [39, 0], [39, 48], [0, 48]]);
    expect(hitArea(centres, 1, 24)).toEqual([[9, 0], [48, 0], [48, 48], [9, 48]]);
  });

  it('cuts only the corner facing a diagonal neighbour', () => {
    // Suello's markers 2 and 3 on a 280px picture: the bottom edge keeps 24 to 29.25px, so 21.5px straight down stays marker 2's.
    expect(hitArea([{ x: 0, y: 0 }, { x: 18, y: 45 }], 0, 24)).toEqual([[0, 0], [48, 0], [48, 40.5], [29.25, 48], [0, 48]]);
  });
});
