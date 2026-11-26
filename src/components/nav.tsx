'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Container } from './container';
import { PROFILE } from '@/content/profile';

const LINKS = [
  { href: '/#work', label: 'Work', always: true },
  { href: '/about/', label: 'About', always: true },
  { href: PROFILE.cv.frontend, label: 'CV', always: false },
];

/**
 * Click listener (capture, on the document) that lets the scroll an in-page link starts glide:
 * `html[data-glide]` turns smooth scrolling on in globals.css. It is removed in the next task;
 * the glide already under way keeps going, and a scroll restore on reload or Back stays instant.
 */
export function glide(e: MouseEvent) {
  if (!(e.target instanceof Element) || !e.target.closest('a[href^="#"]')) return;
  const html = document.documentElement;
  html.dataset.glide = '';
  setTimeout(() => {
    delete html.dataset.glide;
  });
}

export function Nav() {
  const path = usePathname();
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    document.addEventListener('click', glide, true);
    return () => document.removeEventListener('click', glide, true);
  }, []);
  useEffect(() => {
    // The bar grows when its links wrap (a larger default text size): jumps and .from-top follow its
    // real height. Without JavaScript the CSS value, the one-row height, stays.
    const html = document.documentElement;
    const ro = new ResizeObserver(() => {
      if (bar.current) html.style.setProperty('--nav-h', `${bar.current.getBoundingClientRect().height}px`);
    });
    if (bar.current) ro.observe(bar.current);
    return () => ro.disconnect();
  }, []);
  const tone = 'text-text-body transition-colors duration-(--duration-instant) hover:text-text-primary';
  return (
    <header ref={bar} className="site-nav sticky top-0 z-40 bg-bg-base/85 backdrop-blur-md">
      <Container className="flex min-h-14 items-center justify-between gap-4 sm:min-h-16">
        <Link href="/" className="font-semibold tracking-tight text-text-primary">
          <span className="nav-name">{PROFILE.name}</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm sm:gap-7">
          {LINKS.map((l) =>
            l.href === '/#work' && path === '/' ? (
              // On the landing this is a plain in-page link: the browser scrolls there itself, smoothly, and
              // again on a second click. The router jumps, and ignores a click on the address it is already at.
              <a key={l.href} href="#work" className={tone}>
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                // The CV is a PDF, not a route: prefetching it only logs a 404 for a route payload that never exists.
                prefetch={l.href.endsWith('.pdf') ? false : undefined}
                // And it opens in a new tab, so the site stays where the visitor left it.
                target={l.href.endsWith('.pdf') ? '_blank' : undefined}
                rel={l.href.endsWith('.pdf') ? 'noopener' : undefined}
                className={`${tone} ${l.always ? '' : 'hidden sm:inline'}`}
              >
                {l.label}
              </Link>
            ),
          )}
          {/* To the form at the foot of every page; /thanks/ has no form, so there it goes to the address. */}
          <a href={path.startsWith('/thanks') ? '#contact' : '#message'} className="btn-primary">
            {/* Under 375px the bar only fits the short word; the long one stays a single text node for desktop. */}
            <span className="nav-long">Email me</span>
            <span className="nav-short">
              Email<span className="sr-only"> me</span>
            </span>
          </a>
        </nav>
      </Container>
    </header>
  );
}
