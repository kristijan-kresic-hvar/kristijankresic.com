import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { OPEN_LEAD, Screens, slideAt, zoomFactor, zoomScroll } from './screens';

const screens = [
  { src: '/a.webp', alt: 'Demo list' },
  { src: '/b.webp', alt: 'Demo form' },
  { src: '/c.webp', alt: 'Demo chart' },
];

beforeAll(() => {
  // jsdom has the element but not its methods.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  Element.prototype.scrollTo = function () {};
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

describe('Screens', () => {
  it('opens a capture in the lightbox, steps with the arrow keys and wraps', () => {
    render(<Screens title="Demo" screens={screens} />);
    const link = screen.getByRole('link', { name: 'Demo form, view full size' });
    expect(link).toHaveAttribute('href', '/b.webp');
    expect(fireEvent.click(link)).toBe(false); // navigation prevented
    expect(screen.getByRole('img', { name: 'Demo form' })).toHaveAttribute('src', '/b.webp');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    const dialog = screen.getByRole('dialog', { name: 'Demo screens' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: 'Demo list' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous screen' }));
    expect(screen.getByRole('img', { name: 'Demo chart' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('img', { name: /^Demo (list|form|chart)$/ })).not.toBeInTheDocument();
  });

  it('glides to the next picture, but cuts straight across on a wrap', () => {
    const calls: unknown[] = [];
    const spy = vi.spyOn(Element.prototype, 'scrollTo').mockImplementation(function (o?: unknown) {
      calls.push((o as ScrollToOptions | undefined)?.behavior);
    });
    render(<Screens title="Demo" screens={screens} />);
    fireEvent.click(screen.getByRole('link', { name: 'Demo form, view full size' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next screen' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next screen' }));
    spy.mockRestore();
    expect(calls).toEqual(['smooth', 'instant']);
  });

  it('leaves a modified click to the browser, so the capture opens in a new tab', () => {
    render(<Screens title="Demo" screens={screens} />);
    expect(fireEvent.click(screen.getByRole('link', { name: 'Demo list, view full size' }), { metaKey: true })).toBe(true);
    expect(screen.queryByRole('img', { name: /^Demo (list|form|chart)$/ })).not.toBeInTheDocument();
  });
});

describe('Screens with the lead picture', () => {
  const lead = { src: '/lead.webp', alt: 'Lead' };

  it('opens on the lead when the lead picture asks, and counts it as the first of the sequence', () => {
    render(<Screens title="Demo" screens={screens} lead={lead} />);
    const ask = new Event(OPEN_LEAD, { cancelable: true });
    act(() => {
      window.dispatchEvent(ask);
    });
    expect(ask.defaultPrevented).toBe(true); // taken, so the lead's link does not navigate
    expect(screen.getByText('01 / 04')).toBeInTheDocument();
    expect(screen.getByText('Screen 1 of 4')).toBeInTheDocument(); // what a screen reader hears for the digits
    expect(screen.getByRole('img', { name: 'Lead' })).toHaveAttribute('src', '/lead.webp');
  });

  it('opens a grid capture after the lead, and follows the track as it is swiped', () => {
    render(<Screens title="Demo" screens={screens} lead={lead} />);
    fireEvent.click(screen.getByRole('link', { name: 'Demo form, view full size' }));
    expect(screen.getByText('03 / 04')).toBeInTheDocument();
    const track = document.querySelector('.lb-track') as HTMLElement;
    Object.defineProperty(track, 'clientWidth', { value: 390 });
    track.scrollLeft = 390 * 3;
    fireEvent.scroll(track);
    expect(screen.getByText('04 / 04')).toBeInTheDocument();
  });

  it('a tap on a picture zooms it, another tap fits it again', () => {
    render(<Screens title="Demo" screens={screens} />);
    fireEvent.click(screen.getByRole('link', { name: 'Demo list, view full size' }));
    const img = screen.getByRole('img', { name: 'Demo list' });
    fireEvent.click(img);
    expect(img.parentElement).toHaveAttribute('data-zoom', 'true');
    fireEvent.click(img);
    expect(img.parentElement).not.toHaveAttribute('data-zoom');
    expect(screen.getByRole('dialog', { name: 'Demo screens' })).toHaveProperty('open', true); // the tap did not close it
  });

  it('leaves the lead picture alone without a lead: the event is not taken', () => {
    render(<Screens title="Demo" screens={screens} />);
    expect(window.dispatchEvent(new Event(OPEN_LEAD, { cancelable: true }))).toBe(true);
  });
});

describe('slideAt (index from the track position)', () => {
  it('picks the nearest whole slide and stays inside the sequence', () => {
    expect(slideAt(0, 390, 4)).toBe(0);
    expect(slideAt(190, 390, 4)).toBe(0);
    expect(slideAt(200, 390, 4)).toBe(1);
    expect(slideAt(390 * 3 + 40, 390, 4)).toBe(3);
    expect(slideAt(99999, 390, 4)).toBe(3);
    expect(slideAt(-30, 390, 4)).toBe(0);
    expect(slideAt(500, 0, 4)).toBe(0); // not laid out yet
  });
});

describe('zoom', () => {
  it('zooms at least 2x, to the picture\'s own pixels, at most 3x', () => {
    expect(zoomFactor(1200, 1920)).toBe(2);
    expect(zoomFactor(700, 1920)).toBeCloseTo(1920 / 700);
    expect(zoomFactor(358, 1920)).toBe(3);
  });
  it('keeps the tapped spot under the finger', () => {
    // Tapped the middle of a picture zoomed to 1000x600, at (195, 300) in the slide's window.
    expect(zoomScroll({ fx: 0.5, fy: 0.5, width: 1000, height: 600, px: 195, py: 300 })).toEqual({ left: 305, top: 0 });
  });
});
