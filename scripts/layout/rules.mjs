// Pure parts of the layout sweep (docs/prd-interaction-pass.md, Part 4): the window sizes, the
// geometry rules and the grouping of findings. The geometry helpers also run inside the page:
// page.mjs passes their source in, so each must stand alone and only call the others by name.

/** Sweep widths from Part 4. */
export const WIDTHS = [320, 360, 390, 430, 480, 540, 600, 640, 700, 768, 820, 900, 960, 1023, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920, 2560];

/** Phones on their side, from Part 4. */
export const PHONE_SIDES = [[568, 320], [667, 375], [844, 390], [932, 430]];

/**
 * Short, middle and tall window heights for a width. Phones get upright shapes (390 by 844 is the
 * tall one); 600 to 1023 a sideways, a square and an upright one (768 by 572 is the short one);
 * 1024 and up 16:9, 4:3 and a monitor turned upright.
 */
export function heightsFor(w) {
  const f = w < 600 ? [1.33, 1.775, 2.164] : w < 1024 ? [0.745, 1, 1.4] : [0.5625, 0.75, 1.25];
  return f.map((x) => Math.round(w * x));
}

/** Every sweep size: touch under 1024px and at 1180 by 820 and 1366 by 1024, a mouse from 900px. */
export function sweepSizes() {
  const out = [];
  for (const w of WIDTHS)
    for (const h of heightsFor(w)) {
      if (w < 1024) out.push({ w, h, input: 'touch' });
      if (w >= 900) out.push({ w, h, input: 'mouse' });
    }
  for (const [w, h] of [...PHONE_SIDES, [1180, 820], [1366, 1024]]) out.push({ w, h, input: 'touch' });
  return out;
}

/** The stress run's sizes: a short, a middle and a tall window in each width band (V8). */
export function stressSizes() {
  const t = (w, h) => ({ w, h, input: 'touch' });
  const m = (w, h) => ({ w, h, input: 'mouse' });
  return [
    ...heightsFor(390).map((h) => t(390, h)), // phone
    t(568, 320), t(844, 390), t(932, 430), // phone on its side
    ...heightsFor(820).map((h) => t(820, h)), // tablet, the short one sideways
    t(1023, 762), t(1180, 820), t(1366, 1024), // tablet on its side
    ...heightsFor(1280).map((h) => m(1280, h)), // desktop
    ...heightsFor(1920).map((h) => m(1920, h)), // wide
  ];
}

/** The stress variants (V8): what each changes. `font` is the browser's default text size in px. */
export const STRESS = {
  long: { long: true },
  word: { word: true },
  f20: { font: 20 },
  f24: { font: 24 },
  all: { long: true, word: true, font: 24 },
};

/** The overlap of two boxes ({left, right, top, bottom}), or null when they do not meet. */
export function intersect(a, b) {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.right, b.right);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.bottom, b.bottom);
  return right > left && bottom > top ? { left, right, top, bottom } : null;
}

/**
 * The part of a text line box the glyphs fill: the middle half of its height, 1px in from each
 * side. Line boxes of tightly leaded headings overlap their neighbours' by design, and inline
 * pieces of one sentence touch at their ends; neither is two texts on top of each other.
 */
export function core(r) {
  const h = r.bottom - r.top;
  return { left: r.left + 1, right: r.right - 1, top: r.top + h / 4, bottom: r.bottom - h / 4 };
}

/** How far two text line boxes sit on top of each other ({w, h} in px), or null when they do not. */
export function textOverlap(a, b) {
  const i = intersect(core(a), core(b));
  if (!i || i.right - i.left <= 2 || i.bottom - i.top <= 1) return null;
  return { w: Math.round(i.right - i.left), h: Math.round(i.bottom - i.top) };
}

/** How far a box reaches past each side of another, in px (positive means past it). */
export function excess(r, box) {
  return { left: box.left - r.left, right: r.right - box.right, top: box.top - r.top, bottom: r.bottom - box.bottom };
}

/**
 * Lines of a block of text from its line boxes ({left, right, top}), grouped by top within `tol`
 * px and by touching within 2 * `tol` (a date in its own column is not part of the line beside
 * it), and how many characters the widest line holds at the block's average character width.
 */
export function lineStats(rects, chars, tol) {
  const lines = [];
  for (const r of [...rects].sort((a, b) => a.top - b.top)) {
    const l = lines.find((x) => Math.abs(x.top - r.top) <= tol && r.left <= x.right + 2 * tol && r.right >= x.left - 2 * tol);
    if (l) { l.left = Math.min(l.left, r.left); l.right = Math.max(l.right, r.right); }
    else lines.push({ top: r.top, left: r.left, right: r.right });
  }
  const total = rects.reduce((s, r) => s + (r.right - r.left), 0);
  const widest = Math.max(0, ...lines.map((l) => l.right - l.left));
  return { lines: lines.length, widest: total > 0 ? Math.round((widest * chars) / total) : 0 };
}

/** V5: what is wrong with a body text measure, or null. A single line can only be too long. */
export function measureFault(stats) {
  if (stats.widest > 85) return `lines run ${stats.widest} characters (allowed 28 to 85)`;
  if (stats.lines >= 2 && stats.widest < 28) return `lines run ${stats.widest} characters over ${stats.lines} lines (allowed 28 to 85)`;
  return null;
}

/** V3: a picture under 60% of its column with nothing beside it, as a message, or null. */
export function narrowFault(picW, colW, beside) {
  if (beside || colW <= 0 || picW / colW >= 0.6) return null;
  return `picture is ${Math.round((100 * picW) / colW)}% of its column (${Math.round(picW)} of ${Math.round(colW)}px) with nothing beside it`;
}

/** V4: a picture taller than the window under the nav, as a message, or null (1px tolerance). */
export function tallFault(picH, winH, navH) {
  const room = winH - navH;
  return picH > room + 1 ? `picture is ${Math.round(picH)}px tall, the window has ${Math.round(room)}px under the nav` : null;
}

/** V4: a pinned block too tall for the room it pins in, or leaving under 200px below it, or null. */
export function pinFault(h, top, winH, below) {
  const room = winH - top;
  if (h > room + 1) return `pinned block is ${Math.round(h)}px tall, it pins in ${Math.round(room)}px`;
  if (below && room - h < 200) return `pinned block leaves ${Math.round(room - h)}px under it for what scrolls past (needs 200)`;
  return null;
}

/** A size as text, e.g. "768x572 touch". */
export function sizeName(s) {
  return `${s.w}x${s.h} ${s.input}`;
}

/** One printed line per finding. */
export function findingLine(f) {
  return `${f.page} ${sizeName(f.size)} ${f.engine}${f.variant === 'base' ? '' : ` stress:${f.variant}`} ${f.rule} ${f.where}: ${f.what}`;
}

/**
 * Findings grouped across sizes, engines and variants: one entry per page, rule, place and kind of
 * fault (numbers set aside), with the sizes it shows at sorted by width.
 */
export function group(findings) {
  const map = new Map();
  for (const f of findings) {
    const key = [f.page, f.rule, f.where, f.what.replace(/-?\d+(\.\d+)?/g, '#')].join('|');
    const g = map.get(key) ?? { page: f.page, rule: f.rule, where: f.where, kind: f.what, sizes: [], engines: new Set(), variants: new Set(), whats: [] };
    g.sizes.push(f.size);
    g.engines.add(f.engine);
    g.variants.add(f.variant);
    g.whats.push(f.what);
    map.set(key, g);
  }
  return [...map.values()].map((g) => {
    const sizes = [...new Map(g.sizes.map((s) => [sizeName(s), s])).values()].sort((a, b) => a.w - b.w || a.h - b.h);
    return { ...g, sizes, engines: [...g.engines].sort(), variants: [...g.variants].sort() };
  });
}
