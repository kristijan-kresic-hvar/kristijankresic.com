import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { HeroStage } from './hero-stage';
import { lookedAt } from '@/components/plate';
import { PROFILE } from '@/content/profile';
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
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', FEATURED[0]?.image?.alt);
    unmount();
    sessionStorage.setItem(OPENING_KEY, '1');
    render(<HeroStage studies={FEATURED} />);
    expect(path(screen.getByRole('link', { name: `${fourth.title}: open the case study` }))).toBe(`/work/${fourth.slug}`);
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', fourth.image?.alt);
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
    expect(document.querySelector('.stage-face[data-face="a"] img')).toHaveAttribute('alt', third.image?.alt);
    expect(document.querySelector('.stage-face[data-face="b"] img')).toHaveAttribute('alt', first.image?.alt);
  });

  describe('on touch', () => {
    /** A finger going down on the element: React reads the pointer type off the native event. */
    const touch = (el: Element) => fireEvent(el, Object.assign(new MouseEvent('pointerdown', { bubbles: true }), { pointerType: 'touch' }));
    /** True when the hero let the click through to navigate (jsdom cannot navigate, so it is stopped after React). */
    const click = (el: Element, detail: number) => {
      let through = false;
      const stop = (e: Event) => {
        through = !e.defaultPrevented;
        e.preventDefault();
      };
      document.addEventListener('click', stop);
      fireEvent.click(el, { detail });
      document.removeEventListener('click', stop);
      return through;
    };
    const tap = (el: Element) => {
      touch(el);
      return click(el, 1);
    };
    const rows = () => within(screen.getByRole('list')).getAllByRole('link');
    const stageShowing = (showing: boolean) =>
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ matches: showing, media: query }) as MediaQueryList);

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('selects a project on the first tap without opening it, and opens it on the next', () => {
      stageShowing(true);
      render(<HeroStage studies={FEATURED} />);
      const third = rows()[2];
      if (!third) throw new Error('index item missing');
      fireEvent(third, Object.assign(new MouseEvent('pointerenter'), { pointerType: 'touch' }));
      expect(third).not.toHaveAttribute('aria-current');
      expect(tap(third)).toBe(false);
      expect(third).toHaveAttribute('aria-current', 'true');
      expect(path(screen.getByRole('link', { name: `${FEATURED[2]?.title ?? ''}: open the case study` }))).toBe(`/work/${FEATURED[2]?.slug ?? ''}`);
      expect(tap(third)).toBe(true);
    });

    it('leaves the mouse and the keyboard opening a project at once', () => {
      stageShowing(true);
      render(<HeroStage studies={FEATURED} />);
      const [, second, third] = rows();
      if (!second || !third) throw new Error('index items missing');
      expect(click(second, 1)).toBe(true);
      touch(third); // a touch that turned into a scroll, then Enter on the same row
      expect(click(third, 0)).toBe(true);
    });

    it('opens a project at once where there is no stage, on the phone rail', () => {
      stageShowing(false);
      render(<HeroStage studies={FEATURED} />);
      const third = rows()[2];
      if (!third) throw new Error('index item missing');
      expect(tap(third)).toBe(true);
    });
  });

  it('gives phones a first screen that says he is available and leads to contact and the CV', () => {
    render(<HeroStage studies={FEATURED} />);
    expect(document.querySelector('.hero-status')).toHaveTextContent('Available now Remote EU or US-East overlap');
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', '#message');
    expect(screen.getByRole('link', { name: /Frontend CV, PDF/ })).toHaveAttribute('href', PROFILE.cv.frontend);
  });

  it('marks the project the rail has scrolled to as the current one and counts it out of six', () => {
    render(<HeroStage studies={FEATURED} />);
    const rail = screen.getByRole('list');
    const count = document.querySelector('.stage-count');
    expect(count).toHaveTextContent('01 / 06');
    // six plates 301px wide and 12px apart in a 390px window, the third at the left edge
    Array.from(rail.children).forEach((li, i) => {
      Object.defineProperty(li, 'offsetLeft', { value: 20 + i * 313 });
    });
    Object.defineProperty(rail, 'scrollWidth', { value: 1926 });
    Object.defineProperty(rail, 'clientWidth', { value: 390 });
    rail.scrollLeft = 626;
    fireEvent.scroll(rail);
    expect(count).toHaveTextContent('03 / 06');
    expect(count).toHaveStyle({ '--at': '2' });
    const items = within(rail).getAllByRole('link');
    expect(items.map((item) => item.getAttribute('aria-current'))).toEqual([null, null, 'true', null, null, null]);
    expect(items[2]).toHaveAttribute('data-active', 'true');
    rail.scrollLeft = 1536; // the end of the rail, short of the last plate's stop
    fireEvent.scroll(rail);
    expect(count).toHaveTextContent('06 / 06');
  });

  it('server-renders the finished hero: every word, every project, the first plate up, nothing waiting on script', () => {
    const html = renderToString(<HeroStage studies={FEATURED} />);
    const page = document.createElement('div');
    page.innerHTML = html;
    expect(page.querySelector('h1')?.textContent.replace(/ /g, ' ')).toBe('Frontend engineer. Six client products, built inside the client’s team.');
    expect(Array.from(page.querySelectorAll('.stage-index a'), path)).toEqual(FEATURED.map((s) => `/work/${s.slug}`));
    expect(page.querySelector('.stage-face[data-face="a"] img')?.getAttribute('alt')).toBe(FEATURED[0]?.image?.alt);
    expect(page.querySelector('.hero')?.hasAttribute('data-opening')).toBe(false);
    expect(html).not.toMatch(/style="[^"]*(opacity|visibility|display)/);
  });
});
