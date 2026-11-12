import { describe, expect, it } from 'vitest';
import { contours, depthAt, noise3, rgba, SHOAL } from './field';

const still = { x: 0, y: 0, amount: 0 };

describe('noise3', () => {
  it('stays between 0 and 1 and gives the same value for the same point', () => {
    for (let i = 0; i < 200; i++) {
      const n = noise3(i * 0.37, i * 0.91 - 40, i * 0.13);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(1);
      expect(noise3(i * 0.37, i * 0.91 - 40, i * 0.13)).toBe(n);
    }
  });

  it('is continuous across lattice lines', () => {
    expect(Math.abs(noise3(2.9999, 1.5, 0.5) - noise3(3.0001, 1.5, 0.5))).toBeLessThan(0.001);
  });
});

describe('depthAt', () => {
  it('changes slowly over time: under a hundredth of the height range in a tenth of a second', () => {
    expect(Math.abs(depthAt(400, 300, 10, still) - depthAt(400, 300, 10.1, still))).toBeLessThan(0.01);
  });

  it('raises a shoal under the pointer that fades with distance', () => {
    const shoal = { x: 500, y: 300, amount: 1 };
    expect(depthAt(500, 300, 3, shoal) - depthAt(500, 300, 3, still)).toBeCloseTo(SHOAL.height);
    expect(depthAt(500 + SHOAL.spread * 5, 300, 3, shoal) - depthAt(500 + SHOAL.spread * 5, 300, 3, still)).toBeLessThan(0.001);
  });
});

describe('contours', () => {
  const run = (values: number[], cols: number, rows: number) => {
    const segments: number[][] = [];
    contours(values, cols, rows, 10, 0.5, (...s) => segments.push(s));
    return segments;
  };

  it('draws one line through a cell, crossing each edge where the height meets the level', () => {
    // Left column at 0, right at 1: the 0.5 line (line number 1) runs straight down the middle.
    expect(run([0, 1, 0, 1], 2, 2)).toEqual([[5, 0, 5, 10, 1]]);
  });

  it('draws nothing in a flat cell or one with every corner on the same side', () => {
    expect(run([0.2, 0.3, 0.1, 0.4], 2, 2)).toEqual([]);
  });

  it('draws one line per level crossed and numbers each by its height', () => {
    expect(run([0, 1.2, 0, 1.2], 2, 2).map((s) => s[4])).toEqual([1, 2]);
  });

  it('splits a saddle cell into two lines', () => {
    expect(run([1, 0, 0, 1], 2, 2)).toHaveLength(2);
  });
});

describe('rgba', () => {
  it('turns the accent hex into an rgba colour', () => {
    expect(rgba(' #f59e0b', 0.2)).toBe('rgba(245, 158, 11, 0.2)');
  });
});
