import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CopyButton } from './copy-button';

describe('CopyButton', () => {
  it('copies the value and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton value="a@b.c" label="Copy email" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy email' }));
    expect(writeText).toHaveBeenCalledWith('a@b.c');
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Copied'));
  });

  it('falls back gracefully when the clipboard is refused', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<CopyButton value="a@b.c" label="Copy email" />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent('Select to copy'));
  });
});
