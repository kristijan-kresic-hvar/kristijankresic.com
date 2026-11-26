import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Thanks from './page';

describe('/thanks/', () => {
  it('confirms the message and leads back to the start', () => {
    render(<Thanks />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/message is with me/);
    expect(screen.getByRole('link', { name: /Back to the start/ })).toHaveAttribute('href', '/');
  });
});
