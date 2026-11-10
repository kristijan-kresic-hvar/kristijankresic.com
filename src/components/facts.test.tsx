import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Facts } from './facts';
import { PROFILE } from '@/content/profile';

describe('Facts', () => {
  it('puts every recruiter essential one click away', () => {
    render(<Facts />);
    expect(screen.getByText('Available now')).toBeInTheDocument();
    expect(screen.getByText('Hvar, Croatia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Frontend, PDF/ })).toHaveAttribute('href', PROFILE.cv.frontend);
    expect(screen.getByRole('link', { name: /Full-stack, PDF/ })).toHaveAttribute('href', PROFILE.cv.fullstack);
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', PROFILE.github);
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', PROFILE.linkedin);
  });

  it('labels each value with a term', () => {
    render(<Facts rows />);
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Status', 'Stack', 'Based', 'CV', 'Contact']);
  });
});
