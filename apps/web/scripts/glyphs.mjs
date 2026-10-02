// Dev tool: extract Noto Sans Bengali outlines into the 0–100 stroke box → src/dev/glyphs.json
// Also writes a gridded preview SVG per letter to /tmp/lekho-preview/<char>.svg with current strokes.
import opentype from 'opentype.js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const buf = readFileSync(path.join(here, '../dev/NotoSansBengali-Regular.ttf'));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const CHARS = [...'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহৎংঃঁ০১২৩৪৫৬৭৮৯', '\u09DC', '\u09DD', '\u09DF'];

// Per-letter fit: each glyph's bounding box fills [PAD, 100-PAD] preserving aspect, centred (like the kanji demo).
const upm = font.unitsPerEm;
const PAD = 10;
const glyphs = {};
for (const ch of CHARS) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(0, 0, upm); // raw font units, y already flipped (down positive)
  const bb = p.getBoundingBox();
  const w = bb.x2 - bb.x1, h = bb.y2 - bb.y1;
  const scale = (100 - 2 * PAD) / Math.max(w, h);
  const ox = PAD + ((100 - 2 * PAD) - w * scale) / 2 - bb.x1 * scale;
  const oy = PAD + ((100 - 2 * PAD) - h * scale) / 2 - bb.y1 * scale;
  const X = (x) => (x * scale + ox).toFixed(2);
  const Y = (y) => (y * scale + oy).toFixed(2);
  let d = '';
  for (const c of p.commands) {
    if (c.type === 'M') d += `M${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'L') d += `L${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'Q') d += `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'C') d += `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'Z') d += 'Z';
  }
  glyphs[ch.normalize('NFC')] = d;
}
writeFileSync(path.join(here, '../src/dev/glyphs.json'), JSON.stringify(glyphs));
console.log('glyphs.json written for', CHARS.join(''));

// previews
const { listLetters, strokeToPath } = await import('../../../packages/matra/dist/index.js');
const out = '/tmp/lekho-preview';
mkdirSync(out, { recursive: true });
for (const L of listLetters()) {
  const grid = [];
  for (let i = 0; i <= 100; i += 10) {
    grid.push(`<line x1="${i}" y1="0" x2="${i}" y2="100" stroke="#bbb" stroke-width="${i % 50 ? 0.2 : 0.5}"/>`);
    grid.push(`<line x1="0" y1="${i}" x2="100" y2="${i}" stroke="#bbb" stroke-width="${i % 50 ? 0.2 : 0.5}"/>`);
    if (i < 100) grid.push(`<text x="${i + 0.5}" y="2.5" font-size="2.5" fill="#888">${i}</text><text x="0.5" y="${i + 3}" font-size="2.5" fill="#888">${i}</text>`);
  }
  const strokes = (process.env.GLYPH_ONLY ? [] : L.strokes).map((s, i) => {
    const [x, y] = s[0];
    return `<path d="${strokeToPath(s)}" fill="none" stroke="${i === L.strokes.length - 1 ? '#c33' : '#1f2a22'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
      <circle cx="${x}" cy="${y}" r="1.6" fill="#0a0"/><text x="${x + 2}" y="${y - 1.5}" font-size="4" fill="#0a0" font-weight="bold">${i + 1}</text>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="600" height="600"><rect width="100" height="100" fill="#f7f1e3"/>${grid.join('')}<path d="${glyphs[L.char] ?? ''}" fill="#3050d0" opacity="0.3"/>${strokes}</svg>`;
  writeFileSync(path.join(out, `${L.char}.svg`), svg);
}
console.log('previews in', out);
