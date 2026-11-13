/** Pure motion maths for the stage hero. No DOM in here, so every rule can be tested. */

/** Plate tilt limits in degrees. The PRD caps the lean at about six. */
export const TILT = { x: 4, y: 5.5 } as const;

/** Weight of the statement at rest and right under the pointer (Geist's axis runs 100 to 900). */
export const WEIGHT = { rest: 560, peak: 840 } as const;

/** Where the plate rests with no pointer on it: leaned back and away, a band of light across it. */
export const REST = { rx: 2.5, ry: 4.5, lx: 30, lit: 0.6 } as const;

/** Moves `current` toward `target` by a share that depends on elapsed time, not on frame rate. */
export function approach(current: number, target: number, dt: number, rate: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

/** 1 at the pointer, easing to 0 at `radius` and beyond (smoothstep). */
export function falloff(distance: number, radius: number): number {
  const t = Math.min(1, Math.max(0, 1 - distance / radius));
  return t * t * (3 - 2 * t);
}

/** Font weight for a letter `distance` pixels from the pointer. */
export function weightAt(distance: number, radius: number): number {
  return WEIGHT.rest + (WEIGHT.peak - WEIGHT.rest) * falloff(distance, radius);
}

/** Tilt for a pointer at `nx`, `ny` (-1 to 1 from the plate's centre): the plate leans into the pointer. */
export function tiltFor(nx: number, ny: number): { rx: number; ry: number } {
  const clamp = (n: number) => Math.min(1, Math.max(-1, n));
  return { rx: -clamp(ny) * TILT.x, ry: clamp(nx) * TILT.y };
}
