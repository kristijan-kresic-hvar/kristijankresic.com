import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkCard } from './work-card';
import { WORK } from '@/content/work';

describe('WorkCard', () => {
  const study = WORK[0]!;

  it('links to the case study and names it for screen readers', () => {
    render(<WorkCard study={study} />);
    const link = screen.getByRole('link', { name: new RegExp(study.title) });
    expect(link.getAttribute('href')?.replace(/\/$/, '')).toBe(`/work/${study.slug}`);
  });

  it('uses the card-sized image', () => {
    render(<WorkCard study={study} />);
    const img = screen.getByRole('img', { name: study.image.alt });
    expect(img.getAttribute('src')).toContain('-card.webp');
  });
});
