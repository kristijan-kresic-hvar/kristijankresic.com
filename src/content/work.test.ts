import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { WORK, FEATURED, EARLIER, getCaseStudy } from './work';

describe('work content', () => {
  it('has unique slugs that are URL-safe', () => {
    const slugs = WORK.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('splits into featured and earlier without overlap', () => {
    expect(FEATURED.length + EARLIER.length).toBe(WORK.length);
    expect(FEATURED.length).toBe(6);
  });

  it('ships a hero and a card image for every study', () => {
    for (const w of WORK) {
      const hero = path.join(process.cwd(), 'public', w.image.src);
      const card = hero.replace('.webp', '-card.webp');
      expect(existsSync(hero), `${w.slug} hero`).toBe(true);
      expect(existsSync(card), `${w.slug} card`).toBe(true);
      if (w.scroll) expect(existsSync(hero.replace('.webp', '-full.webp')), `${w.slug} full`).toBe(true);
      for (let i = 1; i <= w.screens; i++) {
        expect(existsSync(path.join(process.cwd(), 'public/images/work', `${w.slug}-screen-${i}.webp`)), `${w.slug} screen ${i}`).toBe(true);
      }
    }
  });

  it('places every hotspot inside the image', () => {
    for (const w of WORK) for (const a of w.annotations) {
      expect(a.x, `${w.slug} ${a.title}`).toBeGreaterThan(0);
      expect(a.x).toBeLessThan(100);
      expect(a.y).toBeGreaterThan(0);
      expect(a.y).toBeLessThan(100);
    }
  });

  it('keeps every claim concrete: no superlatives', () => {
    const banned = /\b(first-of-its-kind|world-class|best-in-class|top-\d)\b/i;
    for (const w of WORK) {
      const text = [w.tagline, w.summary, ...w.highlights, w.outcome ?? ''].join(' ');
      expect(text, w.slug).not.toMatch(banned);
    }
  });

  it('looks studies up by slug', () => {
    expect(getCaseStudy('biocirv')?.client).toBe('BioCirV');
    expect(getCaseStudy('nope')).toBeUndefined();
  });
});
