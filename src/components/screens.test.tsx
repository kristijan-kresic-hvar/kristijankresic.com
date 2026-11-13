import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Screens } from './screens';

const screens = ['/a.webp', '/b.webp', '/c.webp'];

beforeAll(() => {
  // jsdom has the element but not its methods.
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

describe('Screens', () => {
  it('opens a capture in the lightbox, steps with the arrow keys and wraps', () => {
    render(<Screens title="Demo" screens={screens} />);
    const link = screen.getByRole('link', { name: 'Demo screen 2, view full size' });
    expect(link).toHaveAttribute('href', '/b.webp');
    expect(fireEvent.click(link)).toBe(false); // navigation prevented
    expect(screen.getByRole('img', { name: 'Demo screen 2' })).toHaveAttribute('src', '/b.webp');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    const dialog = screen.getByRole('dialog', { name: 'Demo screens' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByRole('img', { name: 'Demo screen 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous screen' }));
    expect(screen.getByRole('img', { name: 'Demo screen 3' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('img', { name: /Demo screen/ })).not.toBeInTheDocument();
  });

  it('leaves a modified click to the browser, so the capture opens in a new tab', () => {
    render(<Screens title="Demo" screens={screens} />);
    expect(fireEvent.click(screen.getByRole('link', { name: 'Demo screen 1, view full size' }), { metaKey: true })).toBe(true);
    expect(screen.queryByRole('img', { name: /Demo screen/ })).not.toBeInTheDocument();
  });
});
