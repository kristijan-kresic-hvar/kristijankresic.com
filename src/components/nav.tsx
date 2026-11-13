'use client';

import Link from 'next/link';
import { Container } from './container';
import { PROFILE } from '@/content/profile';

const LINKS = [
  { href: '/#work', label: 'Work', always: true },
  { href: '/about/', label: 'About', always: true },
  { href: PROFILE.cv.frontend, label: 'CV', always: false },
];

export function Nav() {
  return (
    <header className="site-nav sticky top-0 z-40 bg-bg-base/85 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link href="/" className="font-semibold tracking-tight text-text-primary">
          {PROFILE.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm sm:gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              // The CV is a PDF, not a route: prefetching it only logs a 404 for a route payload that never exists.
              prefetch={l.href.endsWith('.pdf') ? false : undefined}
              // And it opens in a new tab, so the site stays where the visitor left it.
              target={l.href.endsWith('.pdf') ? '_blank' : undefined}
              rel={l.href.endsWith('.pdf') ? 'noopener' : undefined}
              // The router ignores a click on the address it is already at, so on the landing this link scrolls there itself.
              onClick={() => {
                if (l.href === location.pathname + location.hash) document.getElementById('work')?.scrollIntoView();
              }}
              className={`text-text-body transition-colors duration-(--duration-instant) hover:text-text-primary ${l.always ? '' : 'hidden sm:inline'}`}
            >
              {l.label}
            </Link>
          ))}
          <a href={`mailto:${PROFILE.email}`} className="btn-primary">
            Email me
          </a>
        </nav>
      </Container>
    </header>
  );
}
