import { describe, expect, it } from 'vitest';
import { approach, falloff, REST, tiltFor, TILT, WEIGHT, weightAt } from './motion';

describe('approach', () => {
  it('closes the same share of the gap in the same time at any frame rate', () => {
    const oneStep = approach(0, 100, 0.1, 9);
    const tenSteps = Array.from({ length: 10 }).reduce<number>((x) => approach(x, 100, 0.01, 9), 0);
    expect(tenSteps).toBeCloseTo(oneStep, 6);
    expect(oneStep).toBeGreaterThan(0);
    expect(oneStep).toBeLessThan(100);
  });
});

describe('falloff and weightAt', () => {
  it('is full at the pointer, zero at the radius and beyond, and never rises with distance', () => {
    expect(falloff(0, 200)).toBe(1);
    expect(falloff(200, 200)).toBe(0);
    expect(falloff(900, 200)).toBe(0);
    const samples = Array.from({ length: 21 }, (_, i) => falloff(i * 10, 200));
    samples.slice(1).forEach((v, i) => expect(v).toBeLessThanOrEqual(samples[i] ?? 1));
  });

  it('maps distance to a weight between rest and peak on the Geist axis', () => {
    expect(weightAt(0, 200)).toBe(WEIGHT.peak);
    expect(weightAt(200, 200)).toBe(WEIGHT.rest);
    expect(weightAt(5000, 200)).toBe(WEIGHT.rest);
  });
});

describe('tiltFor', () => {
  it('leans the plate into the pointer and clamps at its limits', () => {
    expect(tiltFor(0, 0)).toEqual({ rx: -0, ry: 0 });
    expect(tiltFor(1, -1)).toEqual({ rx: TILT.x, ry: TILT.y });
    expect(tiltFor(-1, 1)).toEqual({ rx: -TILT.x, ry: -TILT.y });
    expect(tiltFor(40, -40)).toEqual({ rx: TILT.x, ry: TILT.y });
  });

  it('rests at a lean inside the same limits, so the pointer never adds to it', () => {
    expect(Math.abs(REST.rx)).toBeLessThanOrEqual(TILT.x);
    expect(Math.abs(REST.ry)).toBeLessThanOrEqual(TILT.y);
    expect(Math.abs(REST.rx) + Math.abs(REST.ry)).toBeGreaterThan(0);
  });
});
