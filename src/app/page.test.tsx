import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Home from './page';
import { EARLIER } from '@/content/work';

describe('Landing below the hero', () => {
  it('sets how I work as one paragraph of four claims, each followed by its evidence', () => {
    render(<Home />);
    const section = screen.getByRole('region', { name: 'How I work' });
    const paragraphs = section.querySelectorAll('.practice-para');
    expect(paragraphs).toHaveLength(1);
    const sentences = [...(paragraphs[0]?.children ?? [])];
    expect(sentences).toHaveLength(4);
    for (const sentence of sentences) {
      const claim = sentence.querySelector('strong');
      expect(claim).not.toBeNull();
      expect(sentence.textContent.trim().length).toBeGreaterThan(claim?.textContent.trim().length ?? 0);
    }
    expect(within(section).getByRole('img', { name: /Portrait of/ })).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /More about me/ })).toHaveAttribute('href', expect.stringMatching(/^\/about\/?$/));
  });

  it('lists earlier work as one link per project, dates first, then title and one line', () => {
    render(<Home />);
    const section = screen.getByRole('region', { name: 'Earlier work' });
    const links = within(section).getAllByRole('link');
    expect(links).toHaveLength(EARLIER.length);
    EARLIER.forEach((study, i) => {
      const link = links[i];
      expect(link).toHaveAttribute('href', expect.stringMatching(new RegExp(`^/work/${study.slug}/?$`)));
      expect([...(link?.children ?? [])].map((c) => c.textContent)).toEqual([study.period, study.title, study.tagline]);
    });
  });

  it('keeps the parts in reading order and never repeats the stack list or CV links', () => {
    render(<Home />);
    const practice = screen.getByRole('region', { name: 'How I work' });
    const earlier = screen.getByRole('region', { name: 'Earlier work' });
    expect(practice.compareDocumentPosition(earlier) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const part of [practice, earlier]) {
      expect(within(part).queryByRole('link', { name: /CV/ })).toBeNull();
      expect(within(part).queryByText(/TanStack|Tailwind/)).toBeNull();
    }
  });
});
