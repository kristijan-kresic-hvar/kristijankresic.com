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

  it('offers copy and both CVs under it, once each, and no phone number', () => {
    render(<Ending />);
    expect(screen.getByRole('button', { name: 'Copy email' })).toBeInTheDocument();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    expect(screen.getByRole('link', { name: /Frontend CV/ })).toHaveAttribute('href', PROFILE.cv.frontend);
    expect(screen.getByRole('link', { name: /Full-stack CV/ })).toHaveAttribute('href', PROFILE.cv.fullstack);
  });

  it('carries GitHub and LinkedIn in the bar that closes the page', () => {
    render(<Ending />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toContainElement(screen.getByRole('link', { name: /GitHub/ }));
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', PROFILE.linkedin);
    // External links and the CVs open in a new tab; the address does not.
    for (const name of [/GitHub/, /LinkedIn/, /Frontend CV/, /Full-stack CV/]) expect(screen.getByRole('link', { name })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: PROFILE.email })).not.toHaveAttribute('target');
  });

  it('follows the contact details with the form, in reading order', () => {
    render(<Ending />);
    const details = screen.getByRole('link', { name: /Full-stack CV/ });
    const form = screen.getByRole('form', { name: 'Send a message' });
    expect(details.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2 }).lastElementChild).toHaveAttribute('href', `mailto:${PROFILE.email}`);
  });
});
