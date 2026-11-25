import { describe, expect, it } from 'vitest';
import { core, group, heightsFor, lineStats, measureFault, narrowFault, pinFault, stressSizes, sweepSizes, tallFault, textOverlap } from './rules.mjs';

const box = (left, top, right, bottom) => ({ left, top, right, bottom });

describe('sweep sizes', () => {
  it('holds the two shapes the old picture failed at, and phones on their side', () => {
    const names = sweepSizes().map((s) => `${s.w}x${s.h} ${s.input}`);
    expect(names).toContain('768x572 touch');
    expect(names).toContain('844x390 touch');
    expect(names).toContain('390x844 touch');
    expect(names).toContain('1366x1024 touch');
  });
  it('uses touch under 1024px and a mouse from 900px', () => {
    for (const s of sweepSizes()) {
      if (s.input === 'mouse') expect(s.w).toBeGreaterThanOrEqual(900);
      if (s.input === 'touch' && s.w >= 1024) expect(['1180x820', '1366x1024']).toContain(`${s.w}x${s.h}`);
    }
    expect(sweepSizes().filter((s) => s.w === 960)).toHaveLength(6);
  });
  it('gives each width a short, a middle and a tall window', () => {
    for (const w of [320, 768, 1280]) {
      const [a, b, c] = heightsFor(w);
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(c);
    }
    expect(heightsFor(768)[0]).toBeLessThan(768);
    expect(heightsFor(768)[2]).toBeGreaterThan(768);
  });
  it('stresses three windows in each of six bands', () => {
    expect(stressSizes()).toHaveLength(18);
  });
});

describe('text overlap', () => {
  it('ignores pieces of one sentence that touch end to end', () => {
    expect(textOverlap(box(0, 0, 100, 20), box(100, 0, 180, 20))).toBeNull();
    expect(textOverlap(box(0, 0, 100.5, 20), box(100, 0, 180, 20))).toBeNull();
  });
  it('ignores tightly leaded lines whose boxes overlap a little', () => {
    // Line height under the font's content height: the boxes overlap by 4px, the glyphs do not.
    expect(textOverlap(box(0, 0, 200, 24), box(0, 20, 200, 44))).toBeNull();
  });
  it('reports two texts on top of each other', () => {
    expect(textOverlap(box(0, 0, 200, 20), box(50, 2, 150, 22))).toEqual({ w: 98, h: 8 });
  });
  it('keeps the middle half of a line box', () => {
    expect(core(box(0, 0, 10, 20))).toEqual(box(1, 5, 9, 15));
  });
});

describe('measure', () => {
  it('counts lines and the widest line in characters', () => {
    const rects = [box(0, 0, 600, 20), box(0, 24, 400, 44)];
    expect(lineStats(rects, 100, 8)).toEqual({ lines: 2, widest: 60 });
  });
  it('joins pieces on one line', () => {
    expect(lineStats([box(0, 0, 300, 20), box(300, 1, 600, 21)], 60, 8)).toEqual({ lines: 1, widest: 60 });
  });
  it('keeps a piece in another column apart from the line beside it', () => {
    expect(lineStats([box(0, 0, 100, 20), box(300, 0, 600, 20)], 80, 8)).toEqual({ lines: 2, widest: 60 });
  });
  it('allows 28 to 85 characters, and a short single line', () => {
    expect(measureFault({ lines: 3, widest: 70 })).toBeNull();
    expect(measureFault({ lines: 1, widest: 20 })).toBeNull();
    expect(measureFault({ lines: 1, widest: 90 })).toMatch(/90 characters/);
    expect(measureFault({ lines: 4, widest: 22 })).toMatch(/22 characters over 4 lines/);
  });
});

describe('pictures', () => {
  it('reports a picture at half its column only when nothing is beside it', () => {
    expect(narrowFault(362, 725, false)).toMatch(/50% of its column \(362 of 725px\)/);
    expect(narrowFault(362, 725, true)).toBeNull();
    expect(narrowFault(450, 725, false)).toBeNull();
  });
  it('reports a picture taller than the window under the nav', () => {
    expect(tallFault(497, 390, 65)).toMatch(/497px tall, the window has 325px/);
    expect(tallFault(325.5, 390, 65)).toBeNull();
  });
  it('reports a pinned block too tall, or leaving under 200px when content scrolls under it', () => {
    expect(pinFault(500, 65, 572, false)).toBeNull();
    expect(pinFault(600, 65, 572, false)).toMatch(/600px tall, it pins in 507px/);
    expect(pinFault(400, 65, 572, true)).toMatch(/leaves 107px/);
    expect(pinFault(400, 65, 572, false)).toBeNull();
  });
});

describe('grouping', () => {
  it('folds one fault seen at several sizes and engines into one entry', () => {
    const f = (w, engine, what) => ({ page: '/', size: { w, h: 600, input: 'touch' }, engine, variant: 'base', rule: 'V3', where: 'x', what });
    const g = group([f(768, 'chromium', 'picture is 50% of its column'), f(700, 'webkit', 'picture is 52% of its column'), f(768, 'webkit', 'picture is 50% of its column')]);
    expect(g).toHaveLength(1);
    expect(g[0].sizes.map((s) => s.w)).toEqual([700, 768]);
    expect(g[0].engines).toEqual(['chromium', 'webkit']);
  });
});
