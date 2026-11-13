import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { HeroStage } from './hero-stage';
import { lookedAt } from '@/components/plate';
import { FEATURED } from '@/content/work';
import { OPENING_KEY } from './opening';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  lookedAt('');
  vi.useRealTimers();
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

  it('opens on the project the visitor is coming back from, once the opening has played', () => {
    const fourth = FEATURED[3];
    if (!fourth) throw new Error('needs at least four featured projects');
    lookedAt(fourth.slug);
    // The opening lands on project 01, so until it has played the hero stays there.
    const { unmount } = render(<HeroStage studies={FEATURED} />);
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', FEATURED[0]?.image.alt);
    unmount();
    sessionStorage.setItem(OPENING_KEY, '1');
    render(<HeroStage studies={FEATURED} />);
    expect(path(screen.getByRole('link', { name: `${fourth.title}: open the case study` }))).toBe(`/work/${fourth.slug}`);
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', fourth.image.alt);
  });

  it('ignores the pointer just after arriving, while a plate may still be travelling back', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    render(<HeroStage studies={FEATURED} />);
    const item = within(screen.getByRole('list')).getAllByRole('link')[2];
    if (!item) throw new Error('index item missing');
    fireEvent.pointerMove(item);
    expect(item).toHaveAttribute('data-active', 'false');
    vi.advanceTimersByTime(900);
    fireEvent.pointerMove(item);
    expect(item).toHaveAttribute('data-active', 'true');
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
    // the new project is up and the one it replaced stays under it while it dissolves in
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', third.image.alt);
    expect(document.querySelector('.stage-face[data-face="b"] img')).toHaveAttribute('alt', first.image.alt);
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
