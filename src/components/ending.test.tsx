import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ending } from './ending';
import { PROFILE } from '@/content/profile';

describe('Ending', () => {
  it('ends the closing sentence in the address, as the main link of a labelled section', () => {
    render(<Ending />);
    expect(screen.getByRole('region', { name: /Hiring a frontend engineer/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  it('offers copy, phone and both CVs under it, once each', () => {
    render(<Ending />);
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: PROFILE.phone })).toHaveAttribute('href', PROFILE.phoneHref);
    expect(screen.getByRole('link', { name: /Frontend CV/ })).toHaveAttribute('href', PROFILE.cv.frontend);
    expect(screen.getByRole('link', { name: /Full-stack CV/ })).toHaveAttribute('href', PROFILE.cv.fullstack);
  });

  it('carries GitHub and LinkedIn in the bar that closes the page', () => {
    render(<Ending />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toContainElement(screen.getByRole('link', { name: /GitHub/ }));
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', PROFILE.linkedin);
  });
});
