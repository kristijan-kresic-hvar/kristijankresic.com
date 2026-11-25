#!/usr/bin/env node
// Layout sweep (docs/prd-interaction-pass.md, Part 4). Loads every page at every sweep size in
// Chromium and WebKit through playwright-cli, judges V1 to V5 and the V8 stress run by
// measurement, prints one line per finding and writes contact sheets for V6.
//
//   npm run check:layout [-- <base address>] [--engine=chromium|webkit|both] [--quick]
//                        [--pages=/,/work/buddyins/] [--sizes=768x572,844x390] [--no-stress]
//
// The base address defaults to $LAYOUT_BASE or http://localhost:3000. Output goes to
// scripts/layout/out/ (git-ignored): findings.json, grouped.txt and sheets/index.html.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as rules from './rules.mjs';
import { measure, stress, emulateFontSize, runJob } from './page.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '../..');
const outDir = path.join(here, 'out');
const args = process.argv.slice(2);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const base = (args.find((a) => !a.startsWith('--')) ?? process.env.LAYOUT_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const engine = opt('engine') ?? 'both';
const engines = engine === 'both' ? ['chromium', 'webkit'] : [engine];
const quick = args.includes('--quick');
if (!engines.every((e) => e === 'chromium' || e === 'webkit')) throw new Error(`--engine is chromium, webkit or both, not ${engine}`);

const slugs = [...fs.readFileSync(path.join(root, 'src/content/work.ts'), 'utf8').matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => m[1]);
const allPages = ['/', '/about/', ...slugs.map((s) => `/work/${s}/`), '/thanks/', '/not-sent/', '/no-such-page/'];
const pick = (list, sel) => (sel ? list.filter((x) => sel.split(',').includes(rules.sizeName(x).split(' ')[0]) || sel.split(',').includes(rules.sizeName(x))) : list);
const pageSel = opt('pages')?.split(',');

// The quick run: a representative subset (phones, the two Part 3 shapes, a tablet, a narrow and a
// wide mouse window) on every page, and the combined stress run on two pages.
const Q = (w, h, input) => ({ w, h, input });
const quickSizes = [Q(320, 568, 'touch'), Q(390, 844, 'touch'), Q(768, 572, 'touch'), Q(844, 390, 'touch'), Q(820, 1148, 'touch'), Q(1023, 762, 'mouse'), Q(1440, 810, 'mouse')];
const quickStress = [Q(390, 844, 'touch'), Q(844, 390, 'touch'), Q(1280, 720, 'mouse')];
const pages = pageSel ?? allPages;
const stressPages = pageSel ?? (quick ? ['/', '/work/buddyins/'] : allPages);
const sizes = pick(quick ? quickSizes : rules.sweepSizes(), opt('sizes'));
const sSizes = args.includes('--no-stress') ? [] : pick(quick ? quickStress : rules.stressSizes(), opt('sizes'));
const variants = quick ? ['all'] : Object.keys(rules.STRESS);

const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
const helpers = ['intersect', 'core', 'textOverlap', 'excess', 'lineStats', 'measureFault', 'narrowFault', 'tallFault', 'pinFault'].map((n) => String(rules[n])).join('\n');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'sheets'), { recursive: true });

function tasksFor(eng) {
  const tasks = [];
  for (const pg of pages) for (const s of sizes) tasks.push({ path: pg, ...s, variant: 'base', shot: path.join(outDir, 'sheets', `${eng}-${slug(pg)}-${s.w}x${s.h}-${s.input}.jpg`) });
  for (const pg of stressPages) for (const s of sSizes) for (const v of variants) tasks.push({ path: pg, ...s, variant: v, stress: rules.STRESS[v], rules: ['V1', 'V2', 'V4'] });
  return tasks.map((t, id) => ({ ...t, id }));
}

const run = (cmd, argv) => new Promise((resolve) => {
  const p = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (out += d));
  p.on('close', () => resolve(out));
});

async function sweep(eng) {
  const session = `-s=layout-${eng}`;
  await run('playwright-cli', [session, 'open', ...(eng === 'webkit' ? ['--browser', 'webkit'] : []), 'about:blank']);
  const tasks = tasksFor(eng);
  const found = [];
  const started = Date.now();
  for (let i = 0; i < tasks.length; i += 24) {
    const chunk = tasks.slice(i, i + 24);
    const job = { base, engine: eng, tasks: chunk.map(({ id, path: p, w, h, input, stress: st, rules: r, shot }) => ({ id, path: p, w, h, input, stress: st, rules: r, shot })), measure: String(measure), stress: String(stress), emulate: String(emulateFontSize), helpers };
    const file = path.join(outDir, `run-${eng}-${i / 24}.js`);
    fs.writeFileSync(file, `async (page) => {\n  const job = ${JSON.stringify(job)};\n  return JSON.stringify(await (${String(runJob)})(page, job));\n}\n`);
    const text = await run('playwright-cli', [session, 'run-code', '--filename', file]);
    let res;
    try { res = JSON.parse(JSON.parse(text.split('\n')[1])); } catch { res = chunk.map((t) => ({ id: t.id, found: [{ rule: 'SWEEP', where: 'whole page', what: 'playwright-cli gave no result: ' + text.slice(0, 200).replace(/\s+/g, ' ') }] })); }
    for (const r of res) {
      const t = tasks[r.id];
      for (const f of r.found) {
        const finding = { page: t.path, size: { w: t.w, h: t.h, input: t.input }, engine: eng, variant: t.variant, ...f };
        found.push(finding);
        console.log(rules.findingLine(finding));
      }
    }
    process.stderr.write(`${eng}: ${Math.min(i + 24, tasks.length)} of ${tasks.length} windows judged, ${Math.round((Date.now() - started) / 1000)}s\n`);
  }
  await run('playwright-cli', [session, 'close']);
  return { found, tasks };
}

const results = await Promise.all(engines.map(sweep));
const findings = results.flatMap((r) => r.found);
fs.writeFileSync(path.join(outDir, 'findings.json'), JSON.stringify(findings, null, 1));
const grouped = rules.group(findings);
fs.writeFileSync(path.join(outDir, 'grouped.txt'), grouped.map((g) => `${g.page} ${g.rule} ${g.where}: ${g.whats[0]}\n  ${g.engines.join('+')} ${g.variants.join(',')} at ${g.sizes.map(rules.sizeName).join(', ')}`).join('\n') + '\n');

// Contact sheets (V6): one row per page and engine, every size side by side, narrowest first.
const shots = results.flatMap((r, i) => r.tasks.filter((t) => t.shot && fs.existsSync(t.shot)).map((t) => ({ ...t, engine: engines[i] })));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sheet = pages.map((pg) => engines.map((eng) => {
  const row = shots.filter((t) => t.path === pg && t.engine === eng).sort((a, b) => a.w - b.w || a.h - b.h || a.input.localeCompare(b.input));
  return `<h2>${esc(pg)} <small>${eng}</small></h2><div class="row">${row.map((t) => `<a href="${esc(path.basename(t.shot))}"><img loading="lazy" src="${esc(path.basename(t.shot))}" alt=""><span>${t.w}x${t.h} ${t.input}</span></a>`).join('')}</div>`;
}).join('')).join('\n');
fs.writeFileSync(path.join(outDir, 'sheets', 'index.html'), `<!doctype html><meta charset="utf-8"><title>Layout sweep contact sheets</title><style>body{font:13px system-ui;background:#222;color:#ddd;margin:16px}h2{font-size:15px;margin:24px 0 8px}.row{display:flex;gap:10px;overflow-x:auto;align-items:flex-start;padding-bottom:8px}a{flex:none;color:#aaa;text-decoration:none;display:flex;flex-direction:column;gap:4px}img{width:140px;max-height:900px;object-fit:cover;object-position:top;background:#000}</style><p>${esc(base)}, ${new Date().toISOString()}. Each picture is a whole page; open one for full size.</p>${sheet}`);

console.log(findings.length ? `LAYOUT SWEEP FAILED: ${findings.length} finding(s)` : 'LAYOUT SWEEP OK');
process.exit(findings.length ? 1 : 0);
