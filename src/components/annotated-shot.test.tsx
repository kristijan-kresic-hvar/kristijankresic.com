import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnnotatedShot } from './annotated-shot';

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
    const callout = document.getElementById('callout-1')!;
    fireEvent.focus(callout);
    expect(callout.className).toContain('border-accent');
    expect(screen.getByRole('button', { name: '2. Filters' }).className).toContain('bg-accent');
  });

  it('falls back to a plain image with no annotations', () => {
    render(<AnnotatedShot src="/x.webp" alt="shot" width={1600} height={1000} annotations={[]} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('img', { name: 'shot' })).toBeInTheDocument();
  });
});
