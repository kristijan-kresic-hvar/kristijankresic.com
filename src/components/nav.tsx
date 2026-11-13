'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { Container } from './container';
import { PROFILE } from '@/content/profile';

const LINKS = [
  { href: '/#work', label: 'Work', always: true },
  { href: '/about/', label: 'About', always: true },
  { href: PROFILE.cv.frontend, label: 'CV', always: false },
];

export function Nav() {
  const path = usePathname();
  /** Easter egg: rest the pointer on the name for a second and a stone drops into whichever chart is on screen (field-canvas.ts). */
  const rest = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drop = (el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    dispatchEvent(new CustomEvent('chart-stone', { detail: { x: box.left + box.width / 2, y: box.top + box.height / 2 } }));
  };
  const tone = 'text-text-body transition-colors duration-(--duration-instant) hover:text-text-primary';
  return (
    <header className="site-nav sticky top-0 z-40 bg-bg-base/85 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          className="font-semibold tracking-tight text-text-primary"
          onPointerEnter={(e) => {
            const el = e.currentTarget;
            rest.current = setTimeout(() => drop(el), 1000);
          }}
          onPointerLeave={() => clearTimeout(rest.current)}
        >
          {PROFILE.name}
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
            Email me
          </a>
        </nav>
      </Container>
    </header>
  );
}
