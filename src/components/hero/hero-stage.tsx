'use client';

import Link from 'next/link';
import { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition, type CSSProperties } from 'react';
import { ContourField } from '@/components/contour-field';
import { Facts } from '@/components/facts';
import { ArrowUpRight } from '@/components/icons';
import { lastLookedAt, lookedAt, Plate, plateMorph } from '@/components/plate';
import type { CaseStudy } from '@/content/work';
import { OPENING_KEY, OPENING_MS, OPENING_WAIT, startOpening } from './opening';
import { runStageMotion } from './stage-motion';
import { dragRail } from './rail-drag';
import './hero-stage.css';

/** The statement, split so the first sentence can be set brighter than the rest. */
const STATEMENT = [
  { text: 'Frontend engineer.', lead: true },
  { text: 'Six client products, built inside the client’s team.', lead: false },
];
const WORDS = STATEMENT.flatMap((part) => part.text.split(' ').map((word) => ({ word, lead: part.lead })));

/** Milliseconds after the hero arrives before the pointer may change the project: the plate takes 700 to travel back. */
const SETTLE = 900;

const noop = () => () => {};
const two = (n: number) => String(n).padStart(2, '0');

/**
 * The project the hero opens on: the one the visitor last looked at, so coming back from its case
 * study the plate travels back to the stage. Project 01 on a first load, and while the opening is still to play, because
 * the opening lands on 01.
 */
function returningTo(studies: CaseStudy[]): number {
  const i = studies.findIndex((s) => s.slug === lastLookedAt());
  if (i <= 0) return 0;
  try {
    return sessionStorage.getItem(OPENING_KEY) === null ? 0 : i;
  } catch {
    return i; // storage blocked: the opening never plays
  }
}

/**
 * Hero as a stage. One project plate holds most of the screen and the index beside it chooses
 * which of the six it shows. The plate is a board lying on two more boards: choosing a project
 * dissolves it in over the one it replaces (CSS). On phones the index is a rail of the six plates
 * instead. Server HTML is the finished hero; the opening sequence,
 * the tilt and the reactive type are added on top by script and CSS, and none of them run under
 * reduced motion.
 */
export function HeroStage({ studies }: { studies: CaseStudy[] }) {
  const [active, setActive] = useState(() => returningTo(studies));
  /** The project the active one replaced, kept under it while it dissolves in; -1 before any choice. */
  const [replaced, setReplaced] = useState(-1);
  const statement = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLAnchorElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  /** True only while hydrating server HTML: the inline script must not be rendered on the client. */
  const fromServer = useSyncExternalStore(
    noop,
    () => false,
    () => true,
  );

  // Arriving by client-side navigation there is no inline script, so start the opening here.
  useLayoutEffect(() => startOpening(OPENING_KEY, OPENING_MS, OPENING_WAIT), []);

  useEffect(() => {
    if (!statement.current || !stage.current) return;
    return runStageMotion(stage.current, statement.current);
  }, []);

  useEffect(() => (rail.current ? dragRail(rail.current) : undefined), []);

  /** False just after the hero arrives, so the pointer can be ignored while a plate may still be travelling back. */
  const settled = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      settled.current = true;
    }, SETTLE);
    return () => clearTimeout(timer);
  }, []);

  const pick = (i: number) => {
    if (i === active) return;
    setReplaced(active);
    setActive(i);
    lookedAt(studies[i]?.slug ?? '');
  };
  /** Choosing by pointer. Held off just after arriving: a pointer left over the index would swap the project out from under the plate travelling back. */
  const point = (i: number) => {
    if (settled.current) pick(i);
  };

  const current = studies[active];

  // #work is where the nav's Work link lands: the six projects, not the earlier ones further down.
  return (
    <section id="work" className="hero" suppressHydrationWarning>
      <ContourField className="hero-field" text=".stage-statement, .stage-index, .hero-facts" />
      <h1 ref={statement} className="stage-statement" aria-label={STATEMENT.map((part) => part.text).join(' ')}>
        {WORDS.map(({ word, lead }, n) => (
          <Fragment key={n}>
            {n > 0 && ' '}
            <span aria-hidden="true" className="stage-word" data-lead={lead} style={{ '--w': n } as CSSProperties}>
              {Array.from(word, (letter, k) => (
                <span key={k}>{letter}</span>
              ))}
            </span>
          </Fragment>
        ))}
      </h1>

      <ol ref={rail} className="stage-index">
        {studies.map((study, i) => (
          <li key={study.slug} style={{ '--i': i } as CSSProperties}>
            <Link
              href={`/work/${study.slug}/`}
              className="stage-item"
              data-active={active === i}
              onPointerEnter={() => point(i)}
              onPointerMove={() => point(i)}
              onFocus={() => pick(i)}
            >
              <span className="stage-n">{two(i + 1)}</span>
              <span className="stage-name">{study.client}</span>
              <span className="stage-short">{study.short}</span>
              <span className="stage-thumb frame">
                <Plate study={study} />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {current && (
        <Link ref={stage} href={`/work/${current.slug}/`} aria-label={`${current.title}: open the case study`} className="stage">
          <span className="stage-deck" />
          <span className="stage-deck" />
          <div className="stage-tilt">
            <div className="stage-plate">
              {studies.map((study, i) => (
                // Every plate keeps its name while the hero is mounted: React pairs only transitions that were named
                // when they mounted. `share` picks the one that travels into the case study, the project the link opens.
                <ViewTransition key={study.slug} {...plateMorph(study.slug)} share={i === active ? 'plate-morph' : 'none'}>
                  <div
                    className="stage-face"
                    data-face={i === active ? 'a' : i === replaced ? 'b' : undefined}
                    style={{ '--i': i } as CSSProperties}
                  >
                    {/* The first plate is what the opening lands on and what a late opening shows, so it must not arrive last. */}
                    <Plate study={study} eager priority={i === 0} />
                  </div>
                </ViewTransition>
              ))}
            </div>
            <span className="stage-caption" aria-hidden="true">
              <span className="stage-n">
                {two(active + 1)} / {two(studies.length)}
              </span>
              {current.title}
              <ArrowUpRight />
            </span>
          </div>
        </Link>
      )}

      <Facts className="hero-facts" />

      {fromServer && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `(${startOpening.toString()})(${JSON.stringify(OPENING_KEY)},${OPENING_MS},${OPENING_WAIT})` }}
        />
      )}
    </section>
  );
}
