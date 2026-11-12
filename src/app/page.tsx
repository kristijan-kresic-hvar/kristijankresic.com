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
        <Container className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <figure className="max-w-40 lg:col-span-2 lg:max-w-none">
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
              <strong>I join the client&rsquo;s team:</strong> their standups, Figma and repo from week one.{' '}
              <strong>I own the frontend end to end,</strong> from architecture and data layer to accessibility, performance and
              delivery. <strong>I leave a foundation other people build on.</strong> On BioCirV two other developers built on my
              component system while I reviewed their PRs. <strong>AI does the mechanical work;</strong> every architecture call and
              merged line is mine.
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

      <section id="work" aria-labelledby="earlier-title" className="scroll-mt-20 border-t border-border-subtle py-16 lg:py-20">
        <Container>
          <h2 id="earlier-title" className="text-2xl font-semibold">Earlier work</h2>
          <ul className="mt-6 border-b border-border-default">
            {EARLIER.map((study) => (
              <li key={study.slug}>
                <Link
                  href={`/work/${study.slug}/`}
                  className="earlier group grid gap-x-12 gap-y-1 border-t border-border-default py-4 sm:grid-cols-12 sm:items-baseline"
                >
                  <span className="font-medium text-text-primary sm:col-span-4">{study.title}</span>
                  <span className="text-text-body sm:col-span-5 lg:col-span-6">{study.tagline}</span>
                  <span className="text-sm whitespace-nowrap text-text-muted tabular-nums sm:col-span-3 sm:text-right lg:col-span-2">{study.period}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
