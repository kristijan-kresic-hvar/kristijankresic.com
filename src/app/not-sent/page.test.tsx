import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PROFILE } from '@/content/profile';
import NotSent from './page';

describe('/not-sent/', () => {
  it('says the message failed, gives the address and leads back to the start', () => {
    render(<NotSent />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/did not go through/);
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(screen.getByRole('link', { name: /Back to the start/ })).toHaveAttribute('href', '/');
  });
});
