import { describe, expect, it } from 'vitest';
import { approach, falloff, REST, retarget, sink, stepFlip, tiltFor, TILT, WEIGHT, weightAt, type Spring } from './motion';

const FRAME = 1 / 60;

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
    expect(WEIGHT.rest).toBeGreaterThanOrEqual(100);
    expect(WEIGHT.peak).toBeLessThanOrEqual(900);
  });
});

describe('tiltFor', () => {
  it('leans the plate into the pointer and never past about six degrees', () => {
    expect(tiltFor(0, 0)).toEqual({ rx: -0, ry: 0 });
    expect(tiltFor(1, -1)).toEqual({ rx: TILT.x, ry: TILT.y });
    expect(tiltFor(-1, 1)).toEqual({ rx: -TILT.x, ry: -TILT.y });
    expect(tiltFor(40, -40)).toEqual({ rx: TILT.x, ry: TILT.y });
    expect(Math.max(TILT.x, TILT.y)).toBeLessThanOrEqual(6);
  });

  it('rests at a lean inside the same limits, so the pointer never adds to it', () => {
    expect(Math.abs(REST.rx)).toBeLessThanOrEqual(TILT.x);
    expect(Math.abs(REST.ry)).toBeLessThanOrEqual(TILT.y);
    expect(Math.abs(REST.rx) + Math.abs(REST.ry)).toBeGreaterThan(0);
  });
});

/** Runs the flip spring for `ms`, at 60 frames a second unless told otherwise. */
function run(start: Spring, target: number, ms: number, frame = FRAME) {
  let s = start;
  let peak = s.x;
  for (let t = 0; t < ms; t += frame * 1000) {
    s = stepFlip(s, target, frame);
    peak = Math.max(peak, s.x);
  }
  return { ...s, peak };
}

describe('stepFlip', () => {
  it('turns the plate over and is exactly still within 700ms', () => {
    const end = run({ x: 0, v: 0 }, 1, 700);
    expect(end.x).toBe(1);
    expect(end.v).toBe(0);
  });

  it('is still within 700ms of wall-clock time when frames are slow', () => {
    for (const fps of [30, 15, 10]) {
      const end = run({ x: 0, v: 0 }, 1, 700, 1 / fps);
      expect(end.x).toBe(1);
      expect(end.v).toBe(0);
    }
  });

  it('is in the same place after the same time whatever the frame rate', () => {
    const smooth = run({ x: 0, v: 0 }, 1, 300, 1 / 60);
    const slow = run({ x: 0, v: 0 }, 1, 300, 1 / 10);
    expect(slow.x).toBeCloseTo(smooth.x, 6);
    expect(slow.v).toBeCloseTo(smooth.v, 6);
  });

  it('settles with a small overshoot, not a bounce', () => {
    const { peak } = run({ x: 0, v: 0 }, 1, 700);
    expect(peak).toBeGreaterThan(1);
    expect((peak - 1) * 180).toBeLessThan(5);
  });

  it('is past edge-on, so showing the new project, within 200ms', () => {
    expect(run({ x: 0, v: 0 }, 1, 200).x).toBeGreaterThan(0.5);
  });

  it('does not move a plate that is already where it should be', () => {
    expect(stepFlip({ x: 3, v: 0 }, 3, FRAME)).toEqual({ x: 3, v: 0 });
  });
});

describe('retarget', () => {
  it('puts the new project on the far side and turns one half-turn in the direction of travel', () => {
    expect(retarget(0, [0, -1], 3, 1)).toEqual({ target: 1, faces: [0, 3] });
    expect(retarget(0, [0, -1], 3, -1)).toEqual({ target: -1, faces: [0, 3] });
    expect(retarget(1, [0, 3], 5, 1)).toEqual({ target: 2, faces: [5, 3] });
  });

  it('turns back when the project still facing the viewer is chosen again', () => {
    expect(retarget(0.3, [0, 3], 0, -1)).toEqual({ target: 0, faces: [0, 3] });
    expect(retarget(0.8, [0, 3], 3, 1)).toEqual({ target: 1, faces: [0, 3] });
  });

  it('never swaps the image on the side that is showing, mid-turn or on negative turns', () => {
    expect(retarget(0.4, [0, 3], 4, 1).faces).toEqual([0, 4]);
    expect(retarget(0.6, [0, 3], 4, 1).faces).toEqual([4, 3]);
    expect(retarget(-0.9, [0, 3], 4, -1)).toEqual({ target: -2, faces: [4, 3] });
  });

  it('survives a rake across the index: always a real project facing the viewer, ending on the last one', () => {
    let faces: [number, number] = [0, -1];
    let flip = { x: 0, v: 0, target: 0 };
    let active = 0;
    const showing = () => faces[Math.abs(Math.round(flip.x) % 2)];
    const rake = [1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 2];
    for (const next of rake) {
      const before = showing();
      const aimed = retarget(flip.x, faces, next, next > active ? 1 : -1);
      faces = aimed.faces;
      flip.target = aimed.target;
      active = next;
      expect(showing()).toBe(before);
      // 30ms between index rows: far faster than one turn
      for (let i = 0; i < 2; i++) {
        flip = { ...stepFlip(flip, flip.target, FRAME), target: flip.target };
        expect(showing()).toBeGreaterThanOrEqual(0);
      }
    }
    const end = run(flip, flip.target, 700);
    flip = { x: end.x, v: end.v, target: flip.target };
    expect(flip.x).toBe(flip.target);
    expect(showing()).toBe(2);
  });
});

describe('sink', () => {
  it('is zero when the plate is flat and full when it is edge-on', () => {
    expect(sink(0)).toBe(0);
    expect(sink(2)).toBeCloseTo(0, 10);
    expect(sink(0.5)).toBe(1);
    expect(sink(-1.5)).toBe(1);
  });
});
