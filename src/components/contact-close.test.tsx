import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactClose } from './contact-close';
import { PROFILE } from '@/content/profile';

describe('ContactClose', () => {
  it('makes the address the main link of a labelled section', () => {
    render(<ContactClose />);
    expect(screen.getByRole('region', { name: /Hiring a frontend engineer/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });

  it('offers copy, phone and both CVs beside it', () => {
    render(<ContactClose />);
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: PROFILE.phone })).toHaveAttribute('href', PROFILE.phoneHref);
    expect(screen.getByRole('link', { name: /Frontend CV/ })).toHaveAttribute('href', PROFILE.cv.frontend);
    expect(screen.getByRole('link', { name: /Full-stack CV/ })).toHaveAttribute('href', PROFILE.cv.fullstack);
  });
});
