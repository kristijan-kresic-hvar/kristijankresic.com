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

  it('ships a small crop by default and the full-page capture to wide pointer screens', () => {
    const { container } = render(<WorkCard study={study} />);
    const img = screen.getByRole('img', { name: study.image.alt });
    expect(img.getAttribute('src')).toContain(`${study.slug}-wall.webp`);
    const source = container.querySelector('source');
    expect(source?.getAttribute('srcset')).toContain(`${study.slug}-full.webp`);
    expect(source?.getAttribute('media')).toContain('hover: hover');
  });

  it('captions the tile with the client and its one-line summary', () => {
    render(<WorkCard study={study} />);
    expect(screen.getByText(study.client)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(study.short!))).toBeInTheDocument();
  });
});
