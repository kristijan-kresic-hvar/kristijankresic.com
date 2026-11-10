import Link from 'next/link';
import { Container } from './container';
import { PROFILE } from '@/content/profile';

const LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: PROFILE.cv.frontend, label: 'CV' },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-base/85 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-mono text-sm tracking-wide text-text-primary">
          kk<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-text-body transition-colors hover:text-text-primary">
              {l.label}
            </Link>
          ))}
          <a
            href={`mailto:${PROFILE.email}`}
            className="rounded-md bg-accent px-3 py-1.5 font-medium text-bg-base transition-colors hover:bg-accent-hover"
          >
            Hire me
          </a>
        </nav>
      </Container>
    </header>
  );
}
