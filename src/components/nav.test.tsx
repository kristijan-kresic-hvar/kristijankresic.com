import { afterEach, describe, expect, it, vi } from 'vitest';
import { glide } from './nav';

afterEach(() => {
  vi.useRealTimers();
  delete document.documentElement.dataset.glide;
});

function click(html: string) {
  document.body.innerHTML = html;
  document.querySelector('span')?.addEventListener('click', (e) => {
    glide(e);
    e.preventDefault(); // jsdom cannot follow the link
  });
  document.querySelector('span')?.click();
}

describe('glide', () => {
  it('turns smooth scrolling on for the click on an in-page link, and off again in the next task', () => {
    vi.useFakeTimers();
    click('<a href="#message"><span>Email me</span></a>');
    expect(document.documentElement.dataset.glide).toBe('');
    vi.runAllTimers();
    expect(document.documentElement.dataset.glide).toBeUndefined();
  });

  it('leaves links to other pages alone, so the router and the restore on Back stay instant', () => {
    click('<a href="/about/"><span>About</span></a>');
    expect(document.documentElement.dataset.glide).toBeUndefined();
  });
});
