'use client';

import Link from 'next/link';
import { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, ViewTransition, type CSSProperties } from 'react';
import { Facts } from '@/components/facts';
import { ArrowUpRight } from '@/components/icons';
import { Plate, plateMorph } from '@/components/plate';
import type { CaseStudy } from '@/content/work';
import { OPENING_DEADLINE, OPENING_KEY, OPENING_MS, startOpening } from './opening';
import { runStageMotion } from './stage-motion';
import { runField } from './field-canvas';
import './hero-stage.css';

/** The statement, split so the first sentence can be set brighter than the rest. */
const STATEMENT = [
  { text: 'Frontend engineer.', lead: true },
  { text: 'Six client products, built inside the client’s team.', lead: false },
];
const WORDS = STATEMENT.flatMap((part) => part.text.split(' ').map((word) => ({ word, lead: part.lead })));

const noop = () => () => {};
const two = (n: number) => String(n).padStart(2, '0');

/**
 * Hero as a stage. One project plate holds most of the screen and the index beside it chooses
 * which of the six it shows. The plate is a board lying on two more boards: choosing a project
 * dissolves it in over the one it replaces (CSS). On phones the index is a rail of the six plates
 * instead. Server HTML is the finished hero; the opening sequence,
 * the tilt and the reactive type are added on top by script and CSS, and none of them run under
 * reduced motion.
 */
export function HeroStage({ studies }: { studies: CaseStudy[] }) {
  const [active, setActive] = useState(0);
  /** The project the active one replaced, kept under it while it dissolves in; -1 before any choice. */
  const [replaced, setReplaced] = useState(-1);
  const statement = useRef<HTMLHeadingElement>(null);
  const stage = useRef<HTMLAnchorElement>(null);
  const field = useRef<HTMLCanvasElement>(null);
  /** True only while hydrating server HTML: the inline script must not be rendered on the client. */
  const fromServer = useSyncExternalStore(
    noop,
    () => false,
    () => true,
  );

  // Arriving by client-side navigation there is no inline script, so start the opening here.
  useLayoutEffect(() => startOpening(OPENING_KEY, OPENING_MS), []);

  useEffect(() => {
    if (!statement.current || !stage.current) return;
    return runStageMotion(stage.current, statement.current);
  }, []);

  useEffect(() => {
    const hero = field.current?.parentElement;
    if (!field.current || !hero) return;
    return runField(field.current, hero);
  }, []);

  const pick = (i: number) => {
    if (i === active) return;
    setReplaced(active);
    setActive(i);
  };

  const current = studies[active];

  return (
    <section className="hero" suppressHydrationWarning>
      <canvas ref={field} className="hero-field" aria-hidden="true" />
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

      <ol className="stage-index">
        {studies.map((study, i) => (
          <li key={study.slug} style={{ '--i': i } as CSSProperties}>
            <Link
              href={`/work/${study.slug}/`}
              className="stage-item"
              data-active={active === i}
              onPointerEnter={() => pick(i)}
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
                // Only the project the link opens carries the shared name, so only it travels into the case study.
                <ViewTransition key={study.slug} {...(i === active ? plateMorph(study.slug) : { default: 'none' })}>
                  <div
                    className="stage-face"
                    data-face={i === active ? 'a' : i === replaced ? 'b' : undefined}
                    style={{ '--i': i } as CSSProperties}
                  >
                    <Plate study={study} eager />
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
          dangerouslySetInnerHTML={{ __html: `(${startOpening.toString()})(${JSON.stringify(OPENING_KEY)},${OPENING_MS},${OPENING_DEADLINE})` }}
        />
      )}
    </section>
  );
}
