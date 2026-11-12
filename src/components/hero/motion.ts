/** Pure motion maths for the stage hero. No DOM in here, so every rule can be tested. */

/** Plate tilt limits in degrees. The PRD caps the lean at about six. */
export const TILT = { x: 4, y: 5.5 } as const;

/** Weight of the statement at rest and right under the pointer (Geist's axis runs 100 to 900). */
export const WEIGHT = { rest: 560, peak: 840 } as const;

/** Where the plate rests with no pointer on it: leaned back and away, a band of light across it. */
export const REST = { rx: 2.5, ry: 4.5, lx: 30, lit: 0.6 } as const;

/**
 * Flip spring: natural frequency in radians a second and damping ratio. It reaches the new face
 * in about 280ms, overshoots under three degrees and is still inside 600ms.
 */
const OMEGA = 15;
const ZETA = 0.8;
/** Below this distance and a tenth of this speed (in half-turns) the plate counts as still. About half a degree. */
const STILL = 0.003;

export type Spring = { x: number; v: number };

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

/**
 * The flip spring `dt` seconds on, toward `target`, in half-turns. This is the spring's exact
 * solution, not a numeric step, so the turn takes the same wall-clock time at any frame rate.
 * Snaps to the target once it is still.
 */
export function stepFlip(s: Spring, target: number, dt: number): Spring {
  const decay = ZETA * OMEGA;
  const swing = OMEGA * Math.sqrt(1 - ZETA ** 2);
  const a = s.x - target;
  const b = (s.v + decay * a) / swing;
  const fade = Math.exp(-decay * dt);
  const cos = Math.cos(swing * dt);
  const sin = Math.sin(swing * dt);
  const x = target + fade * (a * cos + b * sin);
  const v = fade * ((b * swing - decay * a) * cos - (a * swing + decay * b) * sin);
  return Math.abs(target - x) < STILL && Math.abs(v) < STILL * 10 ? { x: target, v: 0 } : { x, v };
}

/**
 * Where the plate should turn to when project `next` is chosen, and what each side must carry.
 * The plate has two faces: side 0 shows on even half-turns, side 1 on odd ones. The new project
 * always goes on the side facing away, so no visible image is ever swapped, and the plate keeps
 * turning in the direction of travel through the index (`dir` 1 is down the list).
 */
export function retarget(
  turns: number,
  faces: readonly [number, number],
  next: number,
  dir: 1 | -1,
): { target: number; faces: [number, number] } {
  const showing = Math.round(turns);
  const side = Math.abs(showing % 2);
  if (faces[side] === next) return { target: showing, faces: [faces[0], faces[1]] };
  return { target: showing + dir, faces: side === 0 ? [faces[0], next] : [next, faces[1]] };
}

/** How far the plate has to sink (0 to 1 of half its height) so a turning edge never leaves its frame. */
export function sink(turns: number): number {
  return Math.abs(Math.sin(turns * Math.PI));
}
