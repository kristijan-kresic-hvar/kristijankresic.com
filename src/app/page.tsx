import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/container';
import { HeroStage } from '@/components/hero/hero-stage';
import { ArrowRight } from '@/components/icons';
import { PROFILE } from '@/content/profile';
import { FEATURED, EARLIER } from '@/content/work';

export default function Home() {
  return (
    <>
      <HeroStage studies={FEATURED} />

      <section aria-labelledby="practice-title" className="practice border-t border-border-subtle py-20 lg:py-32">
        <Container className="practice-grid grid gap-y-8 lg:grid-cols-12">
          <figure className="practice-figure max-w-40 lg:col-span-2 lg:max-w-none">
            <Image
              src="/images/headshot.webp"
              alt={`Portrait of ${PROFILE.name}`}
              width={800}
              height={800}
              loading="lazy"
              sizes="(min-width: 1024px) 15vw, 160px"
              className="portrait aspect-[4/5] w-full rounded-[3px] border border-border-strong object-cover"
            />
            <figcaption className="mt-2.5 text-sm text-text-muted">{PROFILE.name}, Hvar</figcaption>
          </figure>
          <div className="lg:col-span-9 lg:col-start-4">
            <h2 id="practice-title" className="sr-only">
              How I work
            </h2>
            <p className="practice-para">
              <span>
                <strong>I join the client&rsquo;s team:</strong> their standups, Figma and repo from week one.
              </span>{' '}
              <span>
                <strong>I own the frontend end to end,</strong> from architecture and data layer to accessibility, performance and
                delivery.
              </span>{' '}
              <span>
                <strong>I leave a foundation other people build on.</strong> On BioCirV two other developers built on my component
                system while I reviewed their PRs.
              </span>{' '}
              <span>
                <strong>AI does the mechanical work;</strong> every architecture call and merged line is mine.
              </span>
            </p>
            <p className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <Link href="/about/" className="link inline-flex items-center gap-2 text-text-primary">
                More about me <ArrowRight />
              </Link>
              <span className="text-sm text-text-muted">Six teams so far: insurance, HIPAA healthcare, telehealth and IoT.</span>
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="earlier-title" className="earlier-work border-t border-border-subtle py-14 lg:py-20">
        <Container>
          <h2 id="earlier-title" className="text-lead font-medium tracking-normal text-text-muted">
            Earlier work
          </h2>
          <ol className="ew-strip mt-8">
            {EARLIER.map((study) => (
              <li key={study.slug}>
                <Link href={`/work/${study.slug}/`} className="ew-cell">
                  <span className="ew-years">{study.period}</span>
                  <span className="ew-title">{study.title}</span>
                  <span className="ew-tag">{study.tagline}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
