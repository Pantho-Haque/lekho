// Dev tool: draft stroke data for letters from Noto Sans Bengali outlines.
//   font outline → fit to 0–100 box → rasterize (scanline, nonzero) → Zhang-Suen thinning → skeleton graph
//   → segments → join smooth continuations into pen strokes → order (headline last) → simplify → TS literal
// usage: node scripts/skeleton.mjs "কখগ" [group] > out.ts        (also writes previews to /tmp/lekho-skel/)
import opentype from 'opentype.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { simplify, strokeToPath, strokeLength } from '../../../packages/matra/dist/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const buf = readFileSync(path.join(here, '../dev/NotoSansBengali-Regular.ttf'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
// merge base+nukta pairs into the precomposed code points the font has glyphs for (U+09DC/09DD/09DF)
const PRE = { 'ড\u09BC': '\u09DC', 'ঢ\u09BC': '\u09DD', 'য\u09BC': '\u09DF' };
const CHARS = [...(process.argv[2] ?? 'ক').normalize('NFC')].reduce((a, c) => { const prev = a[a.length - 1]; if (c === '\u09BC' && prev && PRE[prev + c]) a[a.length - 1] = PRE[prev + c]; else a.push(c); return a; }, []);
const lit = (ch) => ch.codePointAt(0) >= 0x09DC && ch.codePointAt(0) <= 0x09DF ? `'\\u${ch.codePointAt(0).toString(16).padStart(4, "0")}'` : `'${ch}'`;
const GROUP = process.argv[3] ?? 'consonant';
const PAD = 10, R = 256, S = R / 100; // raster resolution: 256 px for the 0–100 box

// ── 1. outline → polygons in box coords ──────────────────────────────────────
function contours(ch) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, font.unitsPerEm);
  const bb = p.getBoundingBox();
  const w = bb.x2 - bb.x1, h = bb.y2 - bb.y1;
  const scale = (100 - 2 * PAD) / Math.max(w, h);
  const ox = PAD + ((100 - 2 * PAD) - w * scale) / 2 - bb.x1 * scale;
  const oy = PAD + ((100 - 2 * PAD) - h * scale) / 2 - bb.y1 * scale;
  const X = (x) => x * scale + ox, Y = (y) => y * scale + oy;
  const polys = []; let cur = null, last = null;
  const q = (p0, p1, p2, n = 8) => { for (let i = 1; i <= n; i++) { const t = i / n, a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t * t; cur.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]); } };
  const cb = (p0, p1, p2, p3, n = 10) => { for (let i = 1; i <= n; i++) { const t = i / n, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3; cur.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]); } };
  for (const c of p.commands) {
    if (c.type === 'M') { cur = [[X(c.x), Y(c.y)]]; polys.push(cur); last = cur[0]; }
    else if (c.type === 'L') { last = [X(c.x), Y(c.y)]; cur.push(last); }
    else if (c.type === 'Q') { q(last, [X(c.x1), Y(c.y1)], [X(c.x), Y(c.y)]); last = cur[cur.length - 1]; }
    else if (c.type === 'C') { cb(last, [X(c.x1), Y(c.y1)], [X(c.x2), Y(c.y2)], [X(c.x), Y(c.y)]); last = cur[cur.length - 1]; }
  }
  return polys.filter((c) => c.length > 2);
}

// ── 2. scanline rasterize, nonzero winding ───────────────────────────────────
function rasterize(polys) {
  const img = new Uint8Array(R * R);
  const edges = [];
  for (const poly of polys) for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (a[1] !== b[1]) edges.push([a[0] * S, a[1] * S, b[0] * S, b[1] * S]);
  }
  for (let py = 0; py < R; py++) {
    const y = py + 0.5, xs = [];
    for (const [x0, y0, x1, y1] of edges) {
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push([x0 + (y - y0) * (x1 - x0) / (y1 - y0), y1 > y0 ? 1 : -1]);
    }
    xs.sort((a, b) => a[0] - b[0]);
    let wind = 0;
    for (let i = 0; i < xs.length - 1; i++) {
      wind += xs[i][1];
      if (wind !== 0) for (let px = Math.max(0, Math.ceil(xs[i][0] - 0.5)); px < Math.min(R, xs[i + 1][0] + 0.5); px++) img[py * R + px] = 1;
    }
  }
  return img;
}

// ── 3. Zhang-Suen thinning ───────────────────────────────────────────────────
function thin(img) {
  const g = Uint8Array.from(img);
  const at = (x, y) => (x < 0 || y < 0 || x >= R || y >= R ? 0 : g[y * R + x]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const pass of [0, 1]) {
      const del = [];
      for (let y = 1; y < R - 1; y++) for (let x = 1; x < R - 1; x++) {
        if (!g[y * R + x]) continue;
        const p2 = at(x, y - 1), p3 = at(x + 1, y - 1), p4 = at(x + 1, y), p5 = at(x + 1, y + 1), p6 = at(x, y + 1), p7 = at(x - 1, y + 1), p8 = at(x - 1, y), p9 = at(x - 1, y - 1);
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (B < 2 || B > 6) continue;
        const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let A = 0; for (let i = 0; i < 8; i++) if (seq[i] === 0 && seq[i + 1] === 1) A++;
        if (A !== 1) continue;
        if (pass === 0 ? (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) : (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0)) continue;
        del.push(y * R + x);
      }
      for (const i of del) g[i] = 0;
      if (del.length) changed = true;
    }
  }
  return g;
}

// ── 4. skeleton → graph → segments ───────────────────────────────────────────
const N8 = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
function segments(sk) {
  const on = (x, y) => x >= 0 && y >= 0 && x < R && y < R && sk[y * R + x] === 1;
  const deg = (x, y) => N8.reduce((n, [dx, dy]) => n + (on(x + dx, y + dy) ? 1 : 0), 0);
  // node pixels: endpoints (deg 1) and junctions (deg >= 3); cluster adjacent junction pixels
  const nodeOf = new Int32Array(R * R).fill(-1); const nodes = [];
  for (let y = 0; y < R; y++) for (let x = 0; x < R; x++) {
    if (!on(x, y) || nodeOf[y * R + x] !== -1) continue;
    const d = deg(x, y);
    if (d === 2) continue;
    const id = nodes.length; const px = [[x, y]]; nodeOf[y * R + x] = id;
    if (d >= 3) { // flood adjacent junction pixels
      const st = [[x, y]];
      while (st.length) { const [cx, cy] = st.pop(); for (const [dx, dy] of N8) { const nx = cx + dx, ny = cy + dy; if (on(nx, ny) && nodeOf[ny * R + nx] === -1 && deg(nx, ny) >= 3) { nodeOf[ny * R + nx] = id; px.push([nx, ny]); st.push([nx, ny]); } } }
    }
    nodes.push({ id, px, x: px.reduce((s, p) => s + p[0], 0) / px.length, y: px.reduce((s, p) => s + p[1], 0) / px.length, end: d === 1 });
  }
  const visited = new Uint8Array(R * R); const segs = [];
  const walk = (sx, sy, fromNode) => { // walk from a node pixel into a deg-2 chain
    const pts = [[nodes[fromNode].x, nodes[fromNode].y]]; let cx = sx, cy = sy, prev = null;
    while (true) {
      if (nodeOf[cy * R + cx] !== -1 && nodeOf[cy * R + cx] !== fromNode) { const n = nodes[nodeOf[cy * R + cx]]; pts.push([n.x, n.y]); return { pts, to: n.id }; }
      if (nodeOf[cy * R + cx] === fromNode && pts.length > 1) { pts.push([nodes[fromNode].x, nodes[fromNode].y]); return { pts, to: fromNode }; }
      visited[cy * R + cx] = 1; pts.push([cx, cy]);
      let next = null;
      for (const [dx, dy] of N8) { const nx = cx + dx, ny = cy + dy; if (!on(nx, ny)) continue; if (prev && nx === prev[0] && ny === prev[1]) continue; if (nodeOf[ny * R + nx] === -1 && visited[ny * R + nx]) continue; if (nodeOf[ny * R + nx] === fromNode && pts.length < 3) continue; next = [nx, ny]; if (nodeOf[ny * R + nx] !== -1) break; }
      if (!next) return { pts, to: -1 };
      prev = [cx, cy]; [cx, cy] = next;
    }
  };
  for (const n of nodes) for (const [px, py] of n.px) for (const [dx, dy] of N8) {
    const nx = px + dx, ny = py + dy;
    if (!on(nx, ny) || visited[ny * R + nx] || nodeOf[ny * R + nx] !== -1) continue;
    const { pts, to } = walk(nx, ny, n.id);
    if (pts.length > 2) segs.push({ a: n.id, b: to, pts });
  }
  // closed loops with no nodes (e.g. ০): start anywhere
  for (let y = 0; y < R; y++) for (let x = 0; x < R; x++) if (on(x, y) && !visited[y * R + x] && nodeOf[y * R + x] === -1) {
    const id = nodes.length; nodes.push({ id, px: [[x, y]], x, y, end: false }); nodeOf[y * R + x] = id;
    for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (on(nx, ny) && !visited[ny * R + nx]) { const { pts } = walk(nx, ny, id); if (pts.length > 2) { segs.push({ a: id, b: id, pts }); break; } } }
  }
  const toBox = (p) => [p[0] / S, p[1] / S];
  return { nodes, segs: segs.map((s) => ({ ...s, pts: s.pts.map(toBox), len: strokeLength(s.pts.map(toBox)) })) };
}

// ── 5. prune spurs, join smooth continuations into strokes ──────────────────
function strokesFrom({ nodes, segs }) {
  const SPUR = 5;
  let changed = true;
  while (changed) {
    changed = false;
    const degree = new Map(); for (const s of segs) { degree.set(s.a, (degree.get(s.a) ?? 0) + 1); degree.set(s.b, (degree.get(s.b) ?? 0) + 1); }
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      const aEnd = degree.get(s.a) === 1, bEnd = degree.get(s.b) === 1;
      if (s.len < SPUR && (aEnd || bEnd) && !(aEnd && bEnd)) { segs.splice(i, 1); changed = true; break; }
    }
  }
  // pair segments at each node by straightest continuation
  const dir = (pts, atStart) => { const k = Math.min(6, pts.length - 1); const p = atStart ? [pts[0], pts[k]] : [pts[pts.length - 1], pts[pts.length - 1 - k]]; const dx = p[1][0] - p[0][0], dy = p[1][1] - p[0][1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  const ends = []; segs.forEach((s, i) => { ends.push({ seg: i, node: s.a, start: true, d: dir(s.pts, true) }); ends.push({ seg: i, node: s.b, start: false, d: dir(s.pts, false) }); });
  const partner = new Map(); // endKey -> endKey
  const key = (e) => `${e.seg}:${e.start ? 's' : 'e'}`;
  const byNode = new Map(); for (const e of ends) { if (!byNode.has(e.node)) byNode.set(e.node, []); byNode.get(e.node).push(e); }
  for (const [, list] of byNode) {
    const cands = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      if (list[i].seg === list[j].seg) continue;
      const cos = list[i].d[0] * list[j].d[0] + list[i].d[1] * list[j].d[1]; // directions point away from node; smooth = opposite (cos ≈ -1)
      if (cos < -0.3) cands.push([cos, list[i], list[j]]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    const used = new Set();
    for (const [, e1, e2] of cands) { if (used.has(key(e1)) || used.has(key(e2))) continue; used.add(key(e1)); used.add(key(e2)); partner.set(key(e1), e2); partner.set(key(e2), e1); }
  }
  // follow chains
  const usedSeg = new Set(); const strokes = [];
  const endsOf = (i) => [ends[2 * i], ends[2 * i + 1]];
  for (let i = 0; i < segs.length; i++) {
    if (usedSeg.has(i)) continue;
    // find a chain start: walk backwards from this seg's start end until no partner
    let cur = ends[2 * i]; const seen = new Set([i]);
    while (partner.has(key(cur))) { const p = partner.get(key(cur)); if (seen.has(p.seg)) break; seen.add(p.seg); cur = endsOf(p.seg).find((e) => e.seg === p.seg && e.start !== p.start); }
    // now cur is the free end of the first segment; traverse forward
    const pts = []; let e = cur;
    while (e && !usedSeg.has(e.seg)) {
      usedSeg.add(e.seg);
      const s = segs[e.seg].pts; const seq = e.start ? s : [...s].reverse();
      pts.push(...(pts.length ? seq.slice(1) : seq));
      const other = endsOf(e.seg).find((x) => x.start !== e.start);
      e = partner.get(key(other));
    }
    if (pts.length > 1) strokes.push(pts);
  }
  return strokes;
}

// ── 6. direction + order heuristics ─────────────────────────────────────────
function finalize(strokes) {
  const out = strokes.map((pts) => {
    const a = pts[0], b = pts[pts.length - 1];
    const score = (p) => p[1] + 0.3 * p[0];
    return simplify(score(a) <= score(b) ? pts : [...pts].reverse(), 1.0).map(([x, y]) => [Math.round(x * 2) / 2, Math.round(y * 2) / 2]);
  }).filter((s) => strokeLength(s) >= 4);
  const isHead = (s) => { const dx = Math.abs(s[s.length - 1][0] - s[0][0]), dy = Math.abs(s[s.length - 1][1] - s[0][1]); const ys = s.map((p) => p[1]); return dx > 35 && dy < 8 && Math.max(...ys) - Math.min(...ys) < 8 && Math.min(...ys) < 40; };
  const heads = out.filter(isHead), body = out.filter((s) => !isHead(s));
  const minX = (s) => Math.min(...s.map((p) => p[0]));
  body.sort((p, q) => (minX(p) + 0.15 * p[0][1]) - (minX(q) + 0.15 * q[0][1]));
  return [...body, ...heads.sort((p, q) => p[0][0] - q[0][0])];
}

// ── run ─────────────────────────────────────────────────────────────────────
mkdirSync('/tmp/lekho-skel', { recursive: true });
const lines = [];
for (const ch of CHARS) {
  const polys = contours(ch);
  const sk = thin(rasterize(polys));
  const strokes = finalize(strokesFrom(segments(sk)));
  const outline = polys.map((c) => 'M' + c.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z').join('');
  const grid = []; for (let i = 0; i <= 100; i += 10) grid.push(`<line x1="${i}" y1="0" x2="${i}" y2="100" stroke="#bbb" stroke-width="${i % 50 ? 0.2 : 0.5}"/><line x1="0" y1="${i}" x2="100" y2="${i}" stroke="#bbb" stroke-width="${i % 50 ? 0.2 : 0.5}"/>`);
  const sv = strokes.map((s, i) => `<path d="${strokeToPath(s)}" fill="none" stroke="${['#1f2a22', '#c33', '#27c', '#2a2', '#a2a', '#e80', '#088'][i % 7]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/><circle cx="${s[0][0]}" cy="${s[0][1]}" r="1.8" fill="#0a0"/><text x="${s[0][0] + 2}" y="${s[0][1] - 1.5}" font-size="5" font-weight="bold" fill="#0a0">${i + 1}</text>`).join('');
  writeFileSync(`/tmp/lekho-skel/${ch}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500"><rect width="100" height="100" fill="#f7f1e3"/>${grid.join('')}<path d="${outline}" fill="#3050d0" opacity=".25"/>${sv}</svg>`);
  lines.push(`  {\n    char: ${lit(ch)}, name: '${ch}', roman: '', group: '${GROUP}',\n    strokes: [\n${strokes.map((s) => `      [${s.map(([x, y]) => `[${x}, ${y}]`).join(', ')}],`).join('\n')}\n    ],\n    parts: ${JSON.stringify(strokes.map((_, i) => [i]))},\n  },`);
  console.error(`${ch}: ${strokes.length} strokes`);
}
console.log(lines.join('\n'));
