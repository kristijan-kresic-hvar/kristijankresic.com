/**
 * Pure maths for the hero's background field: a depth chart of a slowly moving sea floor, drawn
 * as contour lines. The pointer raises a low swell under itself and the nearest contours lean around it.
 * No DOM in here, so every rule can be tested.
 */

/** Pixels per noise unit: how wide one rise or hollow of the sea floor is. */
const SCALE = 300;
/** Drift per second in noise units: the floor shifts sideways and changes shape, both slowly. */
const DRIFT = { x: 0.012, z: 0.05 } as const;
/** Height of the pointer's swell, and its spread in pixels: under two contour lines high and wide, so lines lean instead of closing into rings. */
export const SHOAL = { height: 0.09, spread: 190 } as const;
/** Height between two contour lines. */
export const SPACING = 0.055;
/** Every nth line is an index contour, drawn heavier, as on a printed chart. */
export const INDEX_EVERY = 4;

function hash(x: number, y: number, z: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth value noise in three dimensions, 0 to 1, continuous everywhere. */
export function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = ease(x - xi);
  const v = ease(y - yi);
  const w = ease(z - zi);
  const plane = (k: number) =>
    mix(mix(hash(xi, yi, k), hash(xi + 1, yi, k), u), mix(hash(xi, yi + 1, k), hash(xi + 1, yi + 1, k), u), v);
  return mix(plane(zi), plane(zi + 1), w);
}

export type Shoal = { x: number; y: number; amount: number };

/** Height of the floor at pixel `x`, `y` after `t` seconds, with the pointer's shoal on top. */
export function depthAt(x: number, y: number, t: number, shoal: Shoal): number {
  const nx = x / SCALE + t * DRIFT.x;
  const ny = y / SCALE;
  const floor = noise3(nx, ny, t * DRIFT.z) * 0.68 + noise3(nx * 2.1 + 5.2, ny * 2.1 + 1.3, t * DRIFT.z * 1.6) * 0.32;
  if (shoal.amount === 0) return floor;
  const d2 = (x - shoal.x) ** 2 + (y - shoal.y) ** 2;
  return floor + SHOAL.height * shoal.amount * Math.exp(-d2 / (2 * SHOAL.spread ** 2));
}

/**
 * Marching squares over a grid of heights (`cols` by `rows` points, row by row, `step` pixels
 * apart): calls `emit` with each piece of contour line, one line every `spacing` of height, and
 * with the line's number (its height in spacings).
 */
export function contours(
  values: ArrayLike<number>,
  cols: number,
  rows: number,
  step: number,
  spacing: number,
  emit: (x1: number, y1: number, x2: number, y2: number, line: number) => void,
): void {
  const pts: number[] = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = values[j * cols + i] ?? 0; // top left, then clockwise
      const b = values[j * cols + i + 1] ?? 0;
      const c = values[(j + 1) * cols + i + 1] ?? 0;
      const d = values[(j + 1) * cols + i] ?? 0;
      const lo = Math.min(a, b, c, d);
      const hi = Math.max(a, b, c, d);
      const x = i * step;
      const y = j * step;
      for (let k = Math.ceil(lo / spacing); k * spacing < hi; k++) {
        const level = k * spacing;
        pts.length = 0;
        const cross = (p: number, q: number, x1: number, y1: number, x2: number, y2: number) => {
          if (p < level === q < level) return;
          const t = (level - p) / (q - p);
          pts.push(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
        };
        cross(a, b, x, y, x + step, y); // top
        cross(b, c, x + step, y, x + step, y + step); // right
        cross(d, c, x, y + step, x + step, y + step); // bottom
        cross(a, d, x, y, x, y + step); // left
        if (pts.length === 4) emit(pts[0] ?? 0, pts[1] ?? 0, pts[2] ?? 0, pts[3] ?? 0, k);
        else if (pts.length === 8) {
          // Saddle: the centre decides which pair of opposite corners the lines cut off.
          const [tx = 0, ty = 0, rx = 0, ry = 0, bx = 0, by = 0, lx = 0, ly = 0] = pts;
          if ((a + b + c + d) / 4 < level === a < level) {
            emit(tx, ty, rx, ry, k);
            emit(bx, by, lx, ly, k);
          } else {
            emit(tx, ty, lx, ly, k);
            emit(rx, ry, bx, by, k);
          }
        }
      }
    }
  }
}

/** `#rrggbb` as an rgba() string at `alpha`. */
export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.trim().slice(1, 7), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
