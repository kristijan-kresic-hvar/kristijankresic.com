import { Container } from './container';
import { CopyButton } from './copy-button';
import { Download } from './icons';
import { PROFILE } from '@/content/profile';

/**
 * The last beat of every page: the address is the headline. Sized from its container so the whole
 * address always sits on one line (see `.contact-address` in globals.css).
 */
export function ContactClose() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 border-t border-border-subtle py-20 sm:py-28">
      <Container>
        <h2 id="contact-title" className="max-w-[34ch] text-lead font-normal tracking-normal text-text-body">
          <span className="text-text-primary">Hiring a frontend engineer?</span> Email is the fastest way to reach me. I reply the same
          day.
        </h2>
        <div className="mt-8 overflow-x-clip [container-type:inline-size] sm:mt-10">
          <a
            href={`mailto:${PROFILE.email}`}
            className="contact-address leading-none font-semibold tracking-tight text-text-primary"
          >
            {PROFILE.email}
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm sm:mt-10">
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
        <p className="mt-6 max-w-[62ch] text-sm text-text-body">
          Remote across the EU or with US-East overlap, or hybrid in Split or Zagreb. EU citizen, no visa needed.
        </p>
      </Container>
    </section>
  );
}
