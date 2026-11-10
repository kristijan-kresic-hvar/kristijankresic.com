import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkStrip } from './work-strip';
import { WORK } from '@/content/work';

describe('WorkStrip', () => {
  const study = WORK[0]!;

  it('is one link to the case study, named by what it shows', () => {
    render(<WorkStrip study={study} index={0} />);
    const link = screen.getByRole('link', { name: new RegExp(`^${study.title}`) });
    expect(link).toHaveAccessibleName(expect.stringContaining(study.tagline));
    expect(link.getAttribute('href')?.replace(/\/$/, '')).toBe(`/work/${study.slug}`);
    expect(screen.getByRole('heading', { name: study.title })).toBeInTheDocument();
  });

  it('numbers one frame per inner screen from the strip index', () => {
    const { container } = render(<WorkStrip study={study} index={2} />);
    const labels = [...container.querySelectorAll('li span')].map((s) => s.textContent);
    expect(labels).toEqual(['03A', '03B', '03C'].slice(0, study.screens));
    expect(container.querySelectorAll('img')).toHaveLength(study.screens);
  });
});
