import type { Metadata } from 'next';
import Image from 'next/image';
import { Container } from '@/components/container';
import { Facts } from '@/components/facts';
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
    <Container className="about-page pt-10 pb-20 sm:pt-16 lg:pb-28">
      {/* One grid: the statement, the portrait running down beside it and into the text, the text set in from the edge. */}
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <h1 className="text-display leading-[1.04] font-semibold tracking-tighter lg:col-span-8 lg:pt-10">
          Frontend engineer from Hvar, working with teams anywhere.
        </h1>
        <figure className="max-w-64 lg:col-span-4 lg:row-span-2 lg:max-w-none">
          <Image
            src="/images/headshot.webp"
            alt={`Portrait of ${PROFILE.name}`}
            width={800}
            height={800}
            priority
            sizes="(min-width: 1024px) 30vw, 256px"
            className="portrait aspect-[4/5] w-full rounded-md object-cover"
          />
          <figcaption className="mt-2.5 text-sm text-text-muted">{PROFILE.name}, Hvar</figcaption>
        </figure>
        <div className="max-w-reading space-y-5 text-text-body lg:col-span-6 lg:col-start-3">
          <p className="text-lead text-text-secondary">
            I&apos;ve been building for the web since {PROFILE.since} and shipping it professionally for {PROFILE.yearsProfessional}{' '}
            years. For the last three and a half of those I was at Agilno, a product agency, embedded in six North American client
            teams across insurance, HIPAA healthcare, telehealth and IoT.
          </p>
          <p>
            The pattern repeats: join a team, own the frontend end-to-end, leave behind a foundation other people can build on. On
            BioCirV that meant the component system, data layer and PR reviews for two other developers; on OnCallable it meant
            editors shipping pages without a deploy; on Suello it meant a Bluetooth device layer that just works.
          </p>
          <p>
            I use AI coding tools daily for the mechanical parts of the job. Architecture, security decisions and every merged line
            are mine.
          </p>
          <p>
            Based on Hvar, Croatia (CET). EU citizen. Open to remote roles across Europe or with US-East overlap, and hybrid in Split
            or Zagreb. Available now.
          </p>
        </div>
      </div>

      <section aria-labelledby="timeline-title" className="mt-20 grid gap-x-12 gap-y-8 lg:mt-28 lg:grid-cols-12">
        <h2 id="timeline-title" className="rise text-title leading-[1.08] font-semibold lg:col-span-4">
          Timeline
        </h2>
        <ol className="lg:col-span-8">
          {TIMELINE.map((t) => (
            <li key={t.when} className="rise grid gap-x-8 gap-y-1 border-t border-border-default py-4 last:border-b sm:grid-cols-[11rem_1fr]">
              <span className="text-sm leading-6 text-text-muted tabular-nums">{t.when}</span>
              <span>
                <span className="font-medium text-text-primary">{t.what}</span>
                <span className="mt-0.5 block text-text-body">{t.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Facts className="rise mt-20 lg:mt-28" />
    </Container>
  );
}
