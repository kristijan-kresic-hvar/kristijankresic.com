import { ArrowUpRight, Download } from './icons';
import { LocalTime } from './local-time';
import { PROFILE } from '@/content/profile';

const link = 'link inline-flex items-center gap-1.5 text-text-primary';

/**
 * What a recruiter needs before deciding to scroll: availability, stack, place and time, CVs, contact.
 * Open type on the grid, not a card. `rows` keeps label-and-value rows at every width (the hero);
 * otherwise rows on phones become a block grid from 640 and one line of columns from 1024.
 */
export function Facts({ rows = false, className = '' }: { rows?: boolean; className?: string }) {
  const row = `grid grid-cols-[4.5rem_1fr] gap-x-3 border-t border-border-default py-2.5 ${rows ? '' : 'sm:block sm:pb-0 sm:pt-3'}`;
  const term = `text-sm leading-6 text-text-muted ${rows ? '' : 'sm:mb-1.5'}`;
  return (
    <dl className={`grid text-[0.9375rem] ${rows ? '' : 'gap-x-6 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-5'} ${className}`}>
      <div className={row}>
        <dt className={term}>Status</dt>
        <dd>
          <span className="font-medium text-accent">Available now</span>
          <span className="block text-text-body">Remote EU or US-East overlap, hybrid Split or Zagreb</span>
        </dd>
      </div>
      <div className={row}>
        <dt className={term}>Stack</dt>
        <dd className="text-text-primary">
          React, Next.js, TypeScript, React Native
          <span className="block text-text-body">
            {PROFILE.yearsProfessional} years professional, on the web since {PROFILE.since}
          </span>
        </dd>
      </div>
      <div className={row}>
        <dt className={term}>Based</dt>
        <dd className="text-text-primary">
          Hvar, Croatia
          <span className="block text-text-body">
            <LocalTime /> · EU citizen
          </span>
        </dd>
      </div>
      <div className={row}>
        <dt className={term}>CV</dt>
        <dd className={`flex flex-wrap gap-x-5 gap-y-1 ${rows ? '' : 'sm:flex-col'}`}>
          <a href={PROFILE.cv.frontend} className={link}>
            Frontend, PDF <Download />
          </a>
          <a href={PROFILE.cv.fullstack} className={link}>
            Full-stack, PDF <Download />
          </a>
        </dd>
      </div>
      <div className={`${row} border-b ${rows ? '' : 'sm:border-b-0'}`}>
        <dt className={term}>Contact</dt>
        <dd>
          <a href={`mailto:${PROFILE.email}`} className="link break-all text-text-primary">
            {PROFILE.email}
          </a>
          <span className="mt-0.5 flex gap-x-4 text-text-body">
            <a href={PROFILE.github} className={`${link} text-text-body`}>
              GitHub <ArrowUpRight />
            </a>
            <a href={PROFILE.linkedin} className={`${link} text-text-body`}>
              LinkedIn <ArrowUpRight />
            </a>
          </span>
        </dd>
      </div>
    </dl>
  );
}
