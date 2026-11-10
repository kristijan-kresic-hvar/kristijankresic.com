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

  it('uses the full-page capture for scrolling studies and the card crop otherwise', () => {
    render(<WorkCard study={study} />);
    const img = screen.getByRole('img', { name: study.image.alt });
    const src = decodeURIComponent(img.getAttribute('src') ?? '');
    expect(src).toContain(study.scroll ? `${study.slug}-full.webp` : `${study.slug}-card.webp`);
  });

  it('captions the tile with the client and its one-line summary', () => {
    render(<WorkCard study={study} />);
    expect(screen.getByText(study.client)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(study.short!))).toBeInTheDocument();
  });
});
