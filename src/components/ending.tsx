import { Container } from './container';
import { ContourField } from './contour-field';
import { CopyButton } from './copy-button';
import { ArrowUpRight, Download } from './icons';
import { LocalTime } from './local-time';
import { PROFILE } from '@/content/profile';

/**
 * The end of every page, contact and footer in one: the closing sentence ends in the address,
 * the ways to reach me sit under it, and one thin bar carries the rest. The hero's contour chart
 * returns behind it.
 */
export function Ending() {
  return (
    <footer className="ending border-t border-border-subtle">
      <ContourField className="ending-field" text=".end-say, .end-details, .end-where, .end-bar" />
      <Container className="pt-20 pb-6 sm:pt-28">
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20">
          <h2 id="contact-title" className="end-say">
            <span className="text-text-primary">Hiring a frontend engineer?</span> Email is the fastest way to reach me, and I reply the
            same day.
            <a href={`mailto:${PROFILE.email}`} className="end-mail">
              {PROFILE.email}
            </a>
          </h2>
          <div className="end-details mt-8 flex w-fit flex-wrap items-center gap-x-6 gap-y-3 text-sm sm:mt-10">
            <CopyButton value={PROFILE.email} label="Copy email" />
            <a href={PROFILE.phoneHref} className="link text-text-secondary tabular-nums">
              {PROFILE.phone}
            </a>
            <a href={PROFILE.cv.frontend} className="link inline-flex items-center gap-1.5 text-text-secondary">
              Frontend CV, PDF <Download />
            </a>
            <a href={PROFILE.cv.fullstack} className="link inline-flex items-center gap-1.5 text-text-secondary">
              Full-stack CV, PDF <Download />
            </a>
          </div>
          <p className="end-where mt-6 max-w-[62ch] text-sm text-text-body">
            Remote across the EU or with US-East overlap, or hybrid in Split or Zagreb. EU citizen, no visa needed.
          </p>
        </section>
        <div className="end-bar mt-16 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-border-default pt-5 text-sm text-text-muted sm:mt-24">
          <p>
            © {new Date().getFullYear()} {PROFILE.name} · Hvar, Croatia · <LocalTime />
          </p>
          <ul className="flex gap-x-6">
            <li>
              <a href={PROFILE.github} className="link inline-flex items-center gap-1.5 text-text-secondary">
                GitHub <ArrowUpRight />
              </a>
            </li>
            <li>
              <a href={PROFILE.linkedin} className="link inline-flex items-center gap-1.5 text-text-secondary">
                LinkedIn <ArrowUpRight />
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
