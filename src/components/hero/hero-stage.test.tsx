import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { HeroStage } from './hero-stage';
import { FEATURED } from '@/content/work';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});

/** next/link drops the trailing slash outside a Next build, so compare hrefs without it. */
const path = (el: Element | null | undefined) => el?.getAttribute('href')?.replace(/\/$/, '');

describe('HeroStage', () => {
  it('names the statement for assistive tech although it is set letter by letter', () => {
    render(<HeroStage studies={FEATURED} />);
    const name = screen.getByRole('heading', { level: 1 }).getAttribute('aria-label')?.replace(/ /g, ' ');
    expect(name).toBe('Frontend engineer. Six client products, built inside the client’s team.');
  });

  it('lists each featured project once, linked to its case study', () => {
    render(<HeroStage studies={FEATURED} />);
    const links = within(screen.getByRole('list')).getAllByRole('link');
    expect(links.map(path)).toEqual(FEATURED.map((s) => `/work/${s.slug}`));
  });

  it('switches the stage to the project whose index item takes focus', () => {
    render(<HeroStage studies={FEATURED} />);
    const [first, , third] = FEATURED;
    if (!first || !third) throw new Error('needs at least three featured projects');
    expect(path(screen.getByRole('link', { name: `${first.title}: open the case study` }))).toBe(`/work/${first.slug}`);
    const item = within(screen.getByRole('list')).getAllByRole('link')[2];
    if (!item) throw new Error('index item missing');
    fireEvent.focus(item);
    expect(path(screen.getByRole('link', { name: `${third.title}: open the case study` }))).toBe(`/work/${third.slug}`);
    expect(item).toHaveAttribute('data-active', 'true');
    // the new project waits on the back of the plate; the old one is still on the front
    expect(document.querySelectorAll('.stage-face[data-face]')).toHaveLength(2);
  });

  it('server-renders the finished hero: every word, every project, the first plate up, nothing waiting on script', () => {
    const html = renderToString(<HeroStage studies={FEATURED} />);
    const page = document.createElement('div');
    page.innerHTML = html;
    expect(page.querySelector('h1')?.textContent.replace(/ /g, ' ')).toBe('Frontend engineer. Six client products, built inside the client’s team.');
    expect(Array.from(page.querySelectorAll('.stage-index a'), path)).toEqual(FEATURED.map((s) => `/work/${s.slug}`));
    expect(page.querySelector('.stage-face[data-face="a"] img')?.getAttribute('alt')).toBe(FEATURED[0]?.image.alt);
    expect(page.querySelector('.hero')?.hasAttribute('data-opening')).toBe(false);
    expect(html).not.toMatch(/style="[^"]*(opacity|visibility|display)/);
  });
});
