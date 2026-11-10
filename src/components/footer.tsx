import { Container } from './container';
import { ArrowUpRight, Download } from './icons';
import { LocalTime } from './local-time';
import { NameMark } from './name-mark';
import { PROFILE } from '@/content/profile';

const link = 'inline-flex items-center gap-1.5 text-text-secondary transition-colors duration-(--duration-instant) hover:text-text-primary';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle pt-12 sm:pt-16">
      <Container>
        <div className="grid gap-8 text-sm sm:grid-cols-3 lg:grid-cols-12">
          <p className="lg:col-span-6">
            <span className="text-text-secondary">{PROFILE.headline}</span>
            <br />
            Hvar, Croatia · <LocalTime />
          </p>
          <ul className="space-y-1.5 lg:col-span-3">
            <li>
              <a href={PROFILE.github} className={link}>
                GitHub <ArrowUpRight />
              </a>
            </li>
            <li>
              <a href={PROFILE.linkedin} className={link}>
                LinkedIn <ArrowUpRight />
              </a>
            </li>
          </ul>
          <ul className="space-y-1.5 lg:col-span-3">
            <li>
              <a href={PROFILE.cv.frontend} className={link}>
                Frontend CV, PDF <Download />
              </a>
            </li>
            <li>
              <a href={PROFILE.cv.fullstack} className={link}>
                Full-stack CV, PDF <Download />
              </a>
            </li>
          </ul>
        </div>
        <NameMark className="mt-14 sm:mt-20" />
        <p className="py-6 text-xs text-text-muted">© {new Date().getFullYear()} {PROFILE.name}</p>
      </Container>
    </footer>
  );
}
