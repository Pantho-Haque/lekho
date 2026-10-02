import type { Point, Stroke } from './types';

export const dist = (a: Point, b: Point): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Total polyline length. */
export function strokeLength(s: Stroke): number {
  let L = 0;
  for (let i = 1; i < s.length; i++) L += dist(s[i - 1], s[i]);
  return L;
}

/** Resample a polyline to `n` points spaced equally by arc length. Endpoints are preserved. */
export function resample(s: Stroke, n = 64): Stroke {
  if (s.length === 0) return [];
  if (s.length === 1 || n < 2) return Array.from({ length: Math.max(n, 1) }, () => [s[0][0], s[0][1]] as Point);
  const total = strokeLength(s);
  if (total === 0) return Array.from({ length: n }, () => [s[0][0], s[0][1]] as Point);
  const step = total / (n - 1);
  const out: Stroke = [[s[0][0], s[0][1]]];
  let seg = 0;
  let segStart = 0; // arc length at start of current segment
  for (let k = 1; k < n - 1; k++) {
    const target = k * step;
    while (seg < s.length - 2 && segStart + dist(s[seg], s[seg + 1]) < target) {
      segStart += dist(s[seg], s[seg + 1]);
      seg++;
    }
    const a = s[seg], b = s[seg + 1];
    const segLen = dist(a, b) || 1;
    const t = Math.min(1, Math.max(0, (target - segStart) / segLen));
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  const last = s[s.length - 1];
  out.push([last[0], last[1]]);
  return out;
}

/** Ramer–Douglas–Peucker simplification. Keeps endpoints. */
export function simplify(s: Stroke, epsilon = 1.0): Stroke {
  if (s.length < 3) return s.map((p) => [p[0], p[1]] as Point);
  const keep = new Array<boolean>(s.length).fill(false);
  keep[0] = keep[s.length - 1] = true;
  const stack: [number, number][] = [[0, s.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    let maxD = 0, idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = pointToSegment(s[k], s[i], s[j]);
      if (d > maxD) { maxD = d; idx = k; }
    }
    if (maxD > epsilon && idx !== -1) {
      keep[idx] = true;
      stack.push([i, idx], [idx, j]);
    }
  }
  return s.filter((_, i) => keep[i]).map((p) => [p[0], p[1]] as Point);
}

function pointToSegment(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  const t = Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return dist(p, [a[0] + dx * t, a[1] + dy * t]);
}

export interface Box { x: number; y: number; w: number; h: number }

export function boundingBox(strokes: Stroke[]): Box {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) for (const [x, y] of s) {
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  if (minX === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Uniformly scale + translate strokes so their bounding box fits a 0–100 box with `pad` margin, centred. */
export function normalize(strokes: Stroke[], pad = 10): Stroke[] {
  const b = boundingBox(strokes);
  const size = 100 - 2 * pad;
  const scale = size / Math.max(b.w, b.h, 1e-6);
  const ox = pad + (size - b.w * scale) / 2;
  const oy = pad + (size - b.h * scale) / 2;
  return strokes.map((s) => s.map(([x, y]) => [(x - b.x) * scale + ox, (y - b.y) * scale + oy] as Point));
}

/** SVG path `d` for a stroke. Rounds to 1 decimal. */
export function strokeToPath(s: Stroke): string {
  if (s.length === 0) return '';
  const f = (n: number) => Math.round(n * 10) / 10;
  let d = `M ${f(s[0][0])} ${f(s[0][1])}`;
  for (let i = 1; i < s.length; i++) d += ` L ${f(s[i][0])} ${f(s[i][1])}`;
  return d;
}
