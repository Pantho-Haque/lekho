// Rewrites src/data/*.ts stroke items from bare point arrays `[[x,y],…],` into
// `{ order: n, direction: '…', points: [[x,y],…] },`. Idempotent: existing objects are left alone.
// usage: node scripts/annotate.mjs   (run after adding letters with bare arrays)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { inferDirection } from '../src/direction.ts';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data');
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  const p = path.join(dir, f);
  const lines = readFileSync(p, 'utf8').split('\n');
  let order = 0, changed = 0;
  const out = lines.map((line) => {
    if (/^\s+strokes: \[\s*$/.test(line)) { order = 0; return line; }
    const m = line.match(/^(\s+)(\[\[.*\]\]),\s*$/);
    if (m) { order++; changed++; const pts = JSON.parse(m[2]); return `${m[1]}{ order: ${order}, direction: '${inferDirection(pts)}', points: ${m[2]} },`; }
    if (/^\s+\{ order: \d+,/.test(line)) order++;
    return line;
  });
  if (changed) writeFileSync(p, out.join('\n'));
  console.log(`${f}: ${changed} strokes annotated`);
}
