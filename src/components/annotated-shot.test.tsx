import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnnotatedShot, currentAt, GAP, hitArea, jumpTo, READ } from './annotated-shot';
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

describe('currentAt (the reading line)', () => {
  const line = 300;
  it('lights nothing before the first decision reaches the line', () => {
    expect(currentAt([400, 520, 640], line)).toBeNull();
  });
  it('lights the first decision once its top passes the line, and the one after as it follows', () => {
    expect(currentAt([300, 420, 540], line)).toBe(0);
    expect(currentAt([150, 270, 390], line)).toBe(1);
  });
  it('lights the last decision once its top passes the line, and keeps it as the list leaves', () => {
    expect(currentAt([-200, -80, 40], line)).toBe(2);
    expect(currentAt([-900, -780, -660], line)).toBe(2);
  });
  it('a decision jumped to (top at GAP under the cover) is the one at the line, not the next', () => {
    const cover = 260;
    expect(currentAt([cover + GAP, cover + GAP + 60], cover + READ)).toBe(0);
    expect(currentAt([cover + GAP, cover + GAP + 60], cover + READ, cover)).toBe(0);
  });
  it('with the cover given, the next decision takes over once the current heading slides under it', () => {
    const cover = 300;
    // A 170px tall decision: the old rule kept 0 current with its heading 100px under the cover.
    expect(currentAt([200, 370, 540], cover + READ, cover)).toBe(1);
    expect(currentAt([200, 370, 540], cover + READ)).toBe(0);
    // Still the first before it passes the line, and nothing before that.
    expect(currentAt([320, 490], cover + READ, cover)).toBe(0);
    expect(currentAt([400, 570], cover + READ, cover)).toBeNull();
  });
  it('with the cover given, the last stays current while its heading shows and lets go once it slides under', () => {
    const cover = 300;
    expect(currentAt([-200, 100, cover], cover + READ, cover)).toBe(2);
    expect(currentAt([-200, 100, cover - 1], cover + READ, cover)).toBeNull();
    expect(currentAt([-400, -230, -60], cover + READ, cover)).toBeNull();
    // A last decision shorter than the gap to the line still gets its turn between the one before and none.
    expect(currentAt([100, cover + READ + 10], cover + READ, cover)).toBe(1);
    // Scrolling back up, it is current again as soon as its heading is back out.
    expect(currentAt([-30, cover + 5], cover + READ, cover)).toBe(1);
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

  it('tapping a decision makes it and its marker current, one at a time', () => {
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
