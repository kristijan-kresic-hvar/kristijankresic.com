import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/container';
import { PROFILE } from '@/content/profile';

export const metadata: Metadata = {
  title: 'About',
  description: 'Frontend engineer based on Hvar, Croatia. 4+ years professional, building for the web since 2016.',
};

const TIMELINE = [
  { when: 'Jan 2023 – Aug 2026', what: 'Frontend Developer, Agilno (remote)', note: 'Embedded in six North American client teams: BioCirV, OnCallable, Suello, Vetster, Naitur, BuddyIns.' },
  { when: 'Apr 2022 – Nov 2022', what: 'Frontend Web Developer, amondi GmbH (Zagreb, hybrid)', note: 'CMS-driven React apps.' },
  { when: 'Jul 2020 – Mar 2021', what: 'Web Developer, Reroot (contract)', note: 'Agrivi marketing site redesign.' },
  { when: '2019 – 2021', what: 'Freelance web developer, Hvar', note: 'Robinson Restaurant and local businesses.' },
  { when: '2016 – 2018', what: 'Algebra Bernays University, Zagreb', note: 'Certificate programmes: Frontend Development & Graphic Design; PHP & MySQL Backend Development.' },
];

export default function About() {
  return (
    <Container className="py-12 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wide text-accent">About</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Frontend engineer from Hvar, working with teams anywhere.</h1>
          <div className="mt-6 space-y-4 text-text-body">
            <p>
              I&apos;ve been building for the web since 2016 and shipping it professionally for {PROFILE.yearsProfessional} years. For
              the last three and a half of those I was at Agilno, a product agency, embedded in six North American client teams
              across insurance, HIPAA healthcare, telehealth and IoT.
            </p>
            <p>
              The pattern repeats: join a team, own the frontend end-to-end, leave behind a foundation other people can build on.
              On BioCirV that meant the component system, data layer and PR reviews for two other developers; on OnCallable it
              meant editors shipping pages without a deploy; on Suello it meant a Bluetooth device layer that just works.
            </p>
            <p>
              I use AI coding tools daily for the mechanical parts of the job. Architecture, security decisions and every merged
              line are mine.
            </p>
            <p>
              Based on Hvar, Croatia (CET). EU citizen. Open to remote roles across Europe or with US-East overlap, and hybrid in
              Split or Zagreb. Available now.
            </p>
          </div>

          <h2 className="mt-12 font-mono text-xs uppercase tracking-wide text-text-muted">Timeline</h2>
          <ol className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
            {TIMELINE.map((t) => (
              <li key={t.when} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                <span className="font-mono text-xs text-text-muted">{t.when}</span>
                <span>
                  <span className="text-text-primary">{t.what}</span>
                  <span className="block text-sm text-text-body">{t.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="space-y-6">
          <Image
            src="/images/headshot.webp"
            alt={`Portrait of ${PROFILE.name}`}
            width={800}
            height={800}
            className="w-48 rounded-full border border-border-default lg:w-full"
          />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">CV</dt>
              <dd className="mt-1 flex gap-3">
                <a href={PROFILE.cv.frontend} className="text-accent-text hover:underline">
                  Frontend
                </a>
                <a href={PROFILE.cv.fullstack} className="text-accent-text hover:underline">
                  Full-stack
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Elsewhere</dt>
              <dd className="mt-1 flex gap-3">
                <a href={PROFILE.github} className="text-text-primary hover:underline">
                  GitHub
                </a>
                <a href={PROFILE.linkedin} className="text-text-primary hover:underline">
                  LinkedIn
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-text-muted">Contact</dt>
              <dd className="mt-1">
                <a href={`mailto:${PROFILE.email}`} className="text-text-primary hover:underline">
                  {PROFILE.email}
                </a>
                <br />
                <a href={PROFILE.phoneHref} className="text-text-primary hover:underline">
                  {PROFILE.phone}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </Container>
  );
}
