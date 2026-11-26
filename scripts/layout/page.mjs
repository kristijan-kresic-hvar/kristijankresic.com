// The browser side of the layout sweep. sweep.mjs inlines these functions' source into a
// playwright-cli run-code file, so none of them may use anything outside itself except the
// geometry helpers from rules.mjs, which are put in scope under the same names. The import is
// for the linter and for reading; inside the page the names resolve to the injected copies.
import { intersect, textOverlap, excess, lineStats, measureFault, narrowFault, tallFault, pinFault } from './rules.mjs';

/**
 * Judges the page as it is now, at the top and at rest, and returns its findings: V1 to V5, or
 * the rules named in `o.rules`. Runs in the page.
 */
export function measure(o) {
  const out = [];
  const de = document.documentElement;
  const W = de.clientWidth;
  const H = innerHeight;
  const styles = new Map();
  const cs = (el) => { let s = styles.get(el); if (!s) { s = getComputedStyle(el); styles.set(el, s); } return s; };
  const rx = (r) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
  const clean = (s, n) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const UTIL = /[:[\]/\d]|^(relative|absolute|fixed|sticky|static|flex|grid|block|inline|hidden|contents|truncate|uppercase|lowercase|italic|underline|group|peer|sr-only|not-sr-only|container|grow|shrink|isolate|antialiased|tabular-nums|transition|outline|ring|shadow|border|rounded|invisible|visible)$|^(self|items|justify|place|content|text|bg|font|tracking|leading|border|rounded|shadow|overflow|whitespace|object|min|max|w|h|size|p[xytblrse]?|m[xytblrse]?|gap|space|col|row|order|z|top|left|right|bottom|inset|opacity|duration|ease|delay|decoration|underline|fill|stroke|aspect|basis|flex|grid|auto|scroll|snap|touch|select|pointer|cursor|list|break|line|backdrop|from|to|via|scale|translate|rotate|origin|will|focus|hover|group|peer|lg|md|sm|xl|2xl)-/;
  const tag = (el) => {
    const c = [...el.classList].find((x) => !UTIL.test(x));
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : c ? '.' + c : '');
  };
  // A name a person can find: the heading the element follows, then the element with a class or id
  // that is not a utility, its nearest such ancestor, and its first words.
  const heads = [...document.querySelectorAll('h1, h2, h3')].filter((h) => h.textContent.trim());
  const where = (el) => {
    let head = null;
    for (const h of heads) { if (h === el || h.contains(el) || h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) head = h; else break; }
    let named = el;
    while (named && named !== document.body && !named.id && [...named.classList].every((x) => UTIL.test(x))) named = named.parentElement;
    const self = tag(el);
    const anc = named && named !== el && named !== document.body ? ' in ' + tag(named) : '';
    const text = clean(el.textContent.replace(/ Pneumonoultramicroscopic/g, ''), 32);
    return (head ? `"${clean(head.dataset.sweepName || head.textContent, 40)}"` : 'top of page') + ' > ' + self + anc + (text ? ` "${text}"` : '');
  };
  // The box a piece of text belongs to: a word set letter by letter is named once, as the word.
  const unit = (el) => {
    let u = el;
    while (u.parentElement && u.parentElement !== document.body && (/^(inline|contents)$/.test(cs(u).display) || u.textContent.trim().length <= 2)) u = u.parentElement;
    return u;
  };
  const reported = new Set();
  const say = (rule, el, what, key) => {
    const k = rule + '|' + (key || what) + '|' + where(el);
    if (reported.has(k)) return;
    reported.add(k);
    out.push({ rule, where: where(el), what });
  };
  const on = (r) => !o.rules || o.rules.includes(r);
  const seen = (el) => !el.checkVisibility || el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
  // Visually hidden text for screen readers (sr-only: a 1px box with its overflow hidden, or clipped
  // to nothing) is not clipped text and is not on screen.
  const hiddenCache = new Map();
  const srOnly = (el) => {
    if (!el || el === document.body) return false;
    if (hiddenCache.has(el)) return hiddenCache.get(el);
    const s = cs(el);
    const r = el.getBoundingClientRect();
    const v = ((r.width <= 1 || r.height <= 1) && s.overflow !== 'visible') || s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)' || srOnly(el.parentElement);
    hiddenCache.set(el, v);
    return v;
  };
  // The ancestors whose overflow clips this element, honouring that an absolute or fixed box
  // escapes the overflow of ancestors that are not its containing block. `self`: for the text inside
  // el, which el's own overflow clips too.
  const clipCache = new Map();
  const clippers = (el, self) => {
    const key = self ? 'self' : 'up';
    if (!clipCache.has(el)) clipCache.set(el, {});
    if (clipCache.get(el)[key]) return clipCache.get(el)[key];
    const list = [];
    let pos = cs(el).position;
    for (let a = self ? el : el.parentElement; a && a !== document.body && a !== de; a = a.parentElement) {
      const s = cs(a);
      const transformed = s.transform !== 'none' || s.filter !== 'none' || s.contain.includes('paint');
      const skip = (pos === 'absolute' && s.position === 'static' && !transformed) || (pos === 'fixed' && !transformed);
      if (!skip) {
        pos = 'static';
        if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
          const r = a.getBoundingClientRect();
          const box = { left: r.left + a.clientLeft, top: r.top + a.clientTop, right: r.left + a.clientLeft + a.clientWidth, bottom: r.top + a.clientTop + a.clientHeight };
          list.push({ a, box, x: s.overflowX, y: s.overflowY });
        }
      }
      if (s.position === 'absolute' || s.position === 'fixed') pos = s.position;
    }
    clipCache.get(el)[key] = list;
    return list;
  };
  const scrolls = (v) => v === 'auto' || v === 'scroll';
  const visiblePart = (r, el, self) => {
    let v = r;
    for (const c of clippers(el, self)) {
      const b = { left: c.x === 'visible' ? -1e9 : c.box.left, right: c.x === 'visible' ? 1e9 : c.box.right, top: c.y === 'visible' ? -1e9 : c.box.top, bottom: c.y === 'visible' ? 1e9 : c.box.bottom };
      v = v && intersect(v, b);
    }
    return v;
  };
  const nav = document.querySelector('.site-nav');
  const navH = nav ? nav.getBoundingClientRect().height : 0;

  // Every visible piece of text, with its line boxes and the part of them that shows.
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) {
    const pe = t.parentElement;
    if (!pe || !t.nodeValue.trim() || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(pe.tagName)) continue;
    if (!seen(pe) || srOnly(pe)) continue;
    range.selectNodeContents(t);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5).map(rx);
    if (!rects.length) continue;
    const shown = rects.map((r) => visiblePart(r, pe, true)).filter(Boolean);
    texts.push({ t, pe, rects, shown, fs: parseFloat(cs(pe).fontSize) });
  }

  // V1: nothing wider than the window. A box that scrolls sideways (the hero rail) holds what is
  // past its edge on purpose; what an ancestor clips inside the window does not reach past it.
  if (on('V1')) {
    const sw = document.scrollingElement.scrollWidth;
    if (sw > W + 1) say('V1', document.body, `page scrolls sideways: ${sw}px wide in a ${W}px window`);
    const past = [];
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || (r.right <= W + 1 && r.left >= -1)) continue;
      if (!seen(el) || srOnly(el) || past.some((p) => p.contains(el))) continue;
      if (clippers(el).some((c) => scrolls(c.x))) continue;
      const v = visiblePart(rx(r), el);
      if (!v || (v.right <= W + 1 && v.left >= -1)) continue;
      past.push(el);
      say('V1', el, `reaches ${Math.round(Math.max(v.right - W, -v.left))}px past the window's ${v.right > W + 1 ? 'right' : 'left'} edge (${Math.round(r.width)}px wide, window ${W}px)`);
    }
  }

  if (on('V2')) {
    // Text clipped by its container. An ellipsis or a line clamp is shortening by design; a box that
    // scrolls on that axis keeps the text reachable, also past the boxes outside it (the hero rail
    // inside .hero). Glyphs may overhang their box a little.
    for (const x of texts) {
      let sx = false, sy = false;
      for (const c of clippers(x.pe, true)) {
        const box = c.box;
        let worst = null;
        for (const r of x.rects) {
          const e = excess(r, box);
          const tolY = Math.max(2, x.fs * 0.3);
          if (!sx && !scrolls(c.x) && c.x !== 'visible' && (e.right > 2 || e.left > 2)) worst = worst || (e.right > 2 ? `${Math.round(e.right)}px on the right` : `${Math.round(e.left)}px on the left`);
          if (!sy && !scrolls(c.y) && c.y !== 'visible' && (e.bottom > tolY || e.top > tolY)) worst = worst || (e.bottom > tolY ? `${Math.round(e.bottom)}px at the bottom` : `${Math.round(e.top)}px at the top`);
        }
        sx = sx || scrolls(c.x);
        sy = sy || scrolls(c.y);
        if (!worst) continue;
        let shortened = false;
        for (let a = x.pe; a && a !== c.a.parentElement; a = a.parentElement) {
          const s = cs(a);
          if (s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) shortened = true;
        }
        if (shortened) continue;
        say('V2', unit(x.pe), `text "${clean(unit(x.pe).textContent, 30)}" is cut off by ${tag(c.a)} by ${worst}`, 'clip ' + tag(c.a));
        break;
      }
    }
    // Text on top of other text: the glyph cores of line boxes from different text nodes meet.
    const lines = [];
    texts.forEach((x, i) => x.shown.forEach((r) => lines.push({ r, i })));
    lines.sort((a, b) => a.r.top - b.r.top);
    const pairs = new Set();
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length && lines[j].r.top < lines[i].r.bottom; j++) {
        const A = lines[i], B = lines[j];
        if (A.i === B.i) continue;
        const ov = textOverlap(A.r, B.r);
        if (!ov) continue;
        const a = texts[A.i], b = texts[B.i];
        const k = A.i < B.i ? A.i + ',' + B.i : B.i + ',' + A.i;
        if (pairs.has(k)) continue;
        pairs.add(k);
        say('V2', unit(a.pe), `text "${clean(a.t.nodeValue, 30)}" sits on top of "${clean(b.t.nodeValue, 30)}" (${tag(unit(b.pe))}) by ${ov.w}x${ov.h}px`, 'over ' + where(unit(b.pe)));
      }
    }
  }

  // Pictures: images, videos and drawings at least 120 by 80. Canvases are decorative here (the
  // hero's contour field), and thin rules and icons are under that size.
  const pics = [...document.querySelectorAll('img, video, svg')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 120 && r.height >= 80 && seen(el) && !el.parentElement.closest('svg');
  });
  if (on('V3')) {
    for (const p of pics) {
      if (clippers(p).some((c) => scrolls(c.x))) continue; // cards in a sideways rail are sized by the rail
      const r = p.getBoundingClientRect();
      let col = p.parentElement;
      let cw = 0;
      for (; col && col !== document.body; col = col.parentElement) {
        const s = cs(col);
        cw = col.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
        if (cw > r.width + 2) break;
      }
      if (!col || col === document.body) continue;
      const cr = col.getBoundingClientRect();
      const left = cr.left + col.clientLeft + parseFloat(cs(col).paddingLeft);
      const right = left + cw;
      const besideOf = (b) => Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top) > Math.min((b.bottom - b.top) / 2, r.height / 4) && b.right > left && b.left < right && (b.right <= r.left + 1 || b.left >= r.right - 1);
      const beside = texts.some((x) => x.shown.some(besideOf)) || pics.some((q) => q !== p && !q.contains(p) && !p.contains(q) && besideOf(q.getBoundingClientRect()));
      const m = narrowFault(r.width, cw, beside);
      if (m) say('V3', p, m, 'narrow');
    }
  }

  if (on('V4')) {
    for (const p of pics) {
      const m = tallFault(p.getBoundingClientRect().height, H, navH);
      if (m) say('V4', p, m, 'tall');
    }
    // A pinned block: sticky, not the nav, and with room in its parent to pin. Content scrolls past
    // under it unless something sits beside it, as the side-by-side picture and the side heading do.
    for (const el of document.body.querySelectorAll('*')) {
      const s = cs(el);
      if (s.position !== 'sticky' || el.closest('.site-nav') || !seen(el)) continue;
      const r = el.getBoundingClientRect();
      const parent = el.parentElement.getBoundingClientRect();
      if (parent.height <= r.height + 1 || r.height < 1 || s.top === 'auto') continue;
      const below = !texts.some((x) => el.parentElement.contains(x.pe) && !el.contains(x.pe) && x.shown.some((b) => b.right <= r.left + 1 || b.left >= r.right - 1));
      const m = pinFault(r.height, parseFloat(s.top), H, below);
      if (m) say('V4', el, m, 'pin');
    }
  }

  if (on('V5')) {
    for (const x of texts) if (x.fs < 11.95) say('V5', x.pe, `text at ${+x.fs.toFixed(1)}px (12px is the least)`, 'small');
    // Body text: paragraphs, list items and quotes of a sentence or more, at body sizes. Definition
    // lists (the facts) hold short values a line each, which is not a reading measure.
    for (const b of document.querySelectorAll('p, li, blockquote, figcaption')) {
      // Only the text at the block's main size: a note's bold title sits in the same list item.
      const all = texts.filter((x) => x.pe.closest('p, li, blockquote, figcaption') === b);
      const bySize = new Map();
      for (const x of all) bySize.set(x.fs, (bySize.get(x.fs) || 0) + x.t.nodeValue.length);
      const main = [...bySize].sort((p, q) => q[1] - p[1])[0];
      const own = main ? all.filter((x) => x.fs === main[0]) : [];
      const chars = own.reduce((s, x) => s + x.t.nodeValue.replace(/\s+/g, ' ').length, 0);
      if (!own.length || chars < 60 || own[0].fs > 21) continue;
      const m = measureFault(lineStats(own.flatMap((x) => x.rects), chars, own[0].fs / 2));
      if (m) say('V5', b, m, 'measure');
    }
  }

  // V2: controls are reachable, never stuck under the nav or a pinned block, and in-page jumps land
  // their target below the nav. The page goes back to the top afterwards.
  if (on('V2')) {
    const pinnedOver = (el, r) => {
      const x = Math.min(Math.max((r.left + r.right) / 2, 1), W - 1);
      const y = Math.min(Math.max((r.top + r.bottom) / 2, 1), H - 1);
      const hit = document.elementFromPoint(x, y);
      if (!hit || el.contains(hit) || hit.contains(el)) return null;
      for (let a = hit; a && a !== document.body; a = a.parentElement) if (cs(a).position === 'sticky' || cs(a).position === 'fixed') return a.contains(el) ? null : a;
      return null;
    };
    const controls = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && seen(el) && !srOnly(el) && !el.disabled;
    });
    // Out of reach means covered at the top of the window (under the scroll padding), in the middle
    // and at the bottom alike. A note passing under the pinned picture mid-scroll is the design.
    for (const el of controls) {
      let cover = null;
      for (const block of ['start', 'center', 'end']) {
        el.scrollIntoView({ block, inline: 'nearest' });
        cover = pinnedOver(el, el.getBoundingClientRect());
        if (!cover) break;
      }
      if (cover) say('V2', el, `control is under ${tag(cover)} wherever the page is scrolled to`, 'under ' + tag(cover));
    }
    const targets = new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)).filter(Boolean));
    for (const id of targets) {
      const t = document.getElementById(id);
      if (!t || !seen(t)) continue;
      t.scrollIntoView();
      const top = t.getBoundingClientRect().top;
      if (top < navH - 1 && scrollY > 0) say('V2', t, `jump to #${id} lands ${Math.round(navH - top)}px under the nav`, 'jump');
    }
    scrollTo(0, 0);
  }
  return out;
}

/** Makes the page's text longer (V8): `o.long` adds half of each text again, `o.word` an unbreakable word to every heading, name, label, button and link. */
export function stress(o) {
  const WORD = 'Pneumonoultramicroscopic'; // 24 letters, no break opportunity
  const skip = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE|TEXTAREA)$/;
  const texts = (root) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list = [];
    // Numbers alone (the picture's markers, counters) are not words a translation or a longer name
    // would change, so they keep their length.
    for (let t = w.nextNode(); t; t = w.nextNode()) if (/[^\d\s/.,:]/.test(t.nodeValue) && t.parentElement && !skip.test(t.parentElement.tagName)) list.push(t);
    return list;
  };
  // Findings name sections by their headings as written, not as stretched.
  for (const h of document.querySelectorAll('h1, h2, h3')) h.dataset.sweepName = h.textContent;
  if (o.long) {
    // Each box of text grows by half, at its end. A heading set letter by letter (the hero
    // statement) grows as words, not by doubling every letter.
    const units = new Map();
    for (const t of texts(document.body)) {
      if (t.parentElement.closest('svg')) continue;
      let u = t.parentElement;
      while (u.parentElement !== document.body && (/^(inline|contents)$/.test(getComputedStyle(u).display) || u.textContent.trim().length <= 2)) u = u.parentElement;
      units.set(u, (units.get(u) || '') + t.nodeValue);
    }
    for (const [u, text] of units) {
      const s = text.replace(/\s+/g, ' ').trim();
      u.append(' ' + s.slice(0, Math.ceil(s.length / 2)));
    }
  }
  if (o.word) {
    const done = new Set();
    for (const el of document.querySelectorAll('h1, h2, h3, h4, h5, h6, a, button, label, summary, legend, dt, th, [class*="name"], [class*="label"], [class*="title"]')) {
      const last = texts(el).pop();
      if (!last || done.has(last) || !/[^\d\s]/.test(el.textContent)) continue;
      done.add(last);
      last.nodeValue = last.nodeValue.replace(/(\S)(\s*)$/, `$1 ${WORD}$2`);
    }
  }
}

/**
 * WebKit has no setting for the default text size that a script can reach, so this stands in for
 * it (installed before the page's scripts): the root size becomes `px` unless the page sets its
 * own, and every rem or em in a media query, in the stylesheets and in matchMedia, and in the
 * root element's own declarations, is resolved against `px` as the browser would. Call window.__fontFix() again after late stylesheets.
 */
export function emulateFontSize(px) {
  const fix = (q) => q.replace(/(\d*\.?\d+)r?em\b/g, (m, n) => `${+(parseFloat(n) * px).toFixed(3)}px`);
  const mm = window.matchMedia.bind(window);
  window.matchMedia = (q) => mm(fix(q));
  const walk = (rules) => {
    for (const r of rules) {
      if (r.media && r.type === CSSRule.MEDIA_RULE) { const t = r.media.mediaText; const f = fix(t); if (f !== t) r.media.mediaText = f; }
      // On the root element WebKit resolves rem against 16px, not the root's size, where the real
      // setting would give `px`: the nav height and scroll padding live there, so resolve them here.
      if (r.style && /^(html|:root)$/.test(r.selectorText || '')) for (const prop of [...r.style]) {
        const v = r.style.getPropertyValue(prop);
        if (/rem\b/.test(v)) r.style.setProperty(prop, fix(v), r.style.getPropertyPriority(prop));
      }
      if (r.cssRules) walk(r.cssRules);
    }
  };
  window.__fontFix = () => {
    if (!document.getElementById('__font')) {
      const st = document.createElement('style');
      st.id = '__font';
      st.textContent = `html { font-size: ${px}px; }`;
      document.head.prepend(st);
    }
    for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* another origin's sheet */ } }
  };
  document.addEventListener('DOMContentLoaded', () => window.__fontFix());
}

/**
 * Runs a batch of sweep tasks inside playwright-cli, four windows at a time, and returns their
 * findings. `job` is filled in by sweep.mjs: the address, the engine, the tasks and the source of
 * measure, stress and the font emulation.
 */
export async function runJob(page, job) {
  const browser = page.context().browser();
  const queue = [...job.tasks];
  const results = [];
  const one = async (t) => {
    const ctx = await browser.newContext({ viewport: { width: t.w, height: t.h }, hasTouch: t.input === 'touch', isMobile: t.input === 'touch', deviceScaleFactor: 1, reducedMotion: 'reduce' });
    try {
      const p = await ctx.newPage();
      const font = t.stress && t.stress.font;
      if (font && job.engine === 'chromium') {
        // The real setting: Chromium's default font size preference, as a user would set it.
        const cdp = await ctx.newCDPSession(p);
        await cdp.send('Page.enable');
        await cdp.send('Page.setFontSizes', { fontSizes: { standard: font, fixed: Math.round((font * 13) / 16) } });
      } else if (font) await p.addInitScript(`(${job.emulate})(${font})`);
      await p.goto(job.base + t.path, { waitUntil: 'load', timeout: 60000 });
      await p.waitForTimeout(1200); // hydration, so React does not undo the text changes
      if (t.stress && (t.stress.long || t.stress.word)) await p.evaluate(`(${job.stress})(${JSON.stringify(t.stress)})`);
      // Scroll through so lazy pictures load and scroll-in reveals have run, then back to the top.
      await p.evaluate(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.8)) { scrollTo(0, y); await wait(50); }
        const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r); }));
        await Promise.race([Promise.all(pending), wait(5000)]);
        scrollTo(0, 0);
        await wait(250);
      });
      if (font && job.engine !== 'chromium') await p.evaluate(() => { window.__fontFix(); });
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const found = JSON.parse(await p.evaluate(`JSON.stringify((() => { ${job.helpers}; return (${job.measure})(${JSON.stringify({ rules: t.rules })}); })())`));
      if (t.shot) await p.screenshot({ path: t.shot, fullPage: true, type: 'jpeg', quality: 35 });
      results.push({ id: t.id, found });
    } catch (e) {
      results.push({ id: t.id, found: [{ rule: 'SWEEP', where: 'whole page', what: 'could not be judged: ' + String(e.message || e).split('\n')[0].slice(0, 200) }] });
    } finally {
      await ctx.close();
    }
  };
  await Promise.all([0, 1, 2, 3].map(async () => { while (queue.length) await one(queue.shift()); }));
  return results;
}
