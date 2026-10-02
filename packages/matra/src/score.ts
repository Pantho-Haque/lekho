import type { Letter, LetterScore, Point, Stroke, StrokeScore, Tolerance } from './types';
import { dist, resample, strokeLength } from './geometry';
import { getLetter } from './letters';
import { orientedPoints } from './direction';

export const DEFAULT_TOLERANCE: Tolerance = {
  start: 15,
  end: 15,
  shape: 8,
  shapeBack: 10,
  lengthMin: 0.7,
  lengthMax: 1.5,
  direction: 0.85,
};
// ponytail: one global tolerance for a 100-unit box; pass overrides per call if a letter proves fiddly.

const N = 64;
const WEIGHTS = { shape: 0.35, direction: 0.25, start: 0.15, end: 0.15, length: 0.1 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 1 at zero error, 0 at `tol`, linear between. Values past tol clamp to 0. */
const errScore = (err: number, tol: number) => clamp01(1 - err / tol);

/** Index of the nearest target sample to `p`, searched in [lo, hi]. */
function nearestIn(p: Point, target: Stroke, lo: number, hi: number): [number, number] {
  let best = lo, bestD = Infinity;
  for (let j = lo; j <= hi; j++) {
    const d = dist(p, target[j]);
    if (d < bestD) { bestD = d; best = j; }
  }
  return [best, bestD];
}

/**
 * Project each input point onto the target. The first point searches globally; later points search a
 * window around the previous match (greedy tracking keeps loops in অ/ঐ from snapping to the wrong pass),
 * falling back to a global search when nothing in the window is within `far` units.
 */
function projectWindowed(input: Stroke, target: Stroke, far: number, back = 4, ahead = 12): number[] {
  const last = target.length - 1;
  const idx: number[] = [];
  let prev = nearestIn(input[0], target, 0, last)[0];
  idx.push(prev);
  for (let i = 1; i < input.length; i++) {
    let [best, d] = nearestIn(input[i], target, Math.max(0, prev - back), Math.min(last, prev + ahead));
    if (d > far) best = nearestIn(input[i], target, 0, last)[0];
    idx.push(best);
    prev = best;
  }
  return idx;
}

function meanNearest(from: Stroke, to: Stroke): number {
  let sum = 0;
  for (const p of from) {
    let m = Infinity;
    for (const q of to) { const d = dist(p, q); if (d < m) m = d; }
    sum += m;
  }
  return sum / from.length;
}

/** Score one drawn stroke against one target stroke. Deterministic heuristic, 0–1. */
export function scoreStroke(input: Stroke, target: Stroke, tol: Partial<Tolerance> = {}): StrokeScore {
  const T = { ...DEFAULT_TOLERANCE, ...tol };
  const fail: StrokeScore = { confidence: 0, pass: false, start: 0, end: 0, shape: 0, length: 0, direction: 0 };
  if (input.length < 2 || target.length < 2) return fail;

  const inLen = strokeLength(input), tgLen = strokeLength(target);
  if (inLen === 0 || tgLen === 0) return fail;

  const a = resample(input, N), b = resample(target, N);

  const startErr = dist(a[0], b[0]);
  const endErr = dist(a[N - 1], b[N - 1]);
  const fwd = meanNearest(a, b);
  const back = meanNearest(b, a);
  const ratio = inLen / tgLen;

  // direction: among steps that move along the target, what fraction move forward?
  const proj = projectWindowed(a, b, T.shape * 3);
  let fwdSteps = 0, moving = 0;
  for (let i = 1; i < proj.length; i++) {
    const d = proj[i] - proj[i - 1];
    if (d === 0) continue;
    moving++;
    if (d > 0) fwdSteps++;
  }
  const dirFrac = moving ? fwdSteps / moving : 0;

  const start = errScore(startErr, T.start);
  const end = errScore(endErr, T.end);
  const shape = Math.min(errScore(fwd, T.shape), errScore(back, T.shapeBack));
  // length: 1 at ratio 1, 0 at the tolerance band edge
  const lengthErr = ratio < 1 ? (1 - ratio) / (1 - T.lengthMin) : (ratio - 1) / (T.lengthMax - 1);
  const length = clamp01(1 - lengthErr);
  const direction = clamp01((dirFrac - 0.5) / 0.5);

  const pass =
    startErr <= T.start &&
    endErr <= T.end &&
    fwd <= T.shape &&
    back <= T.shapeBack &&
    ratio >= T.lengthMin &&
    ratio <= T.lengthMax &&
    dirFrac >= T.direction;

  const confidence =
    shape * WEIGHTS.shape + direction * WEIGHTS.direction + start * WEIGHTS.start + end * WEIGHTS.end + length * WEIGHTS.length;

  return { confidence, pass, start, end, shape, length, direction };
}

/** Score a full drawing (ordered strokes) against a letter. Order-aware: input[i] vs target[i]. */
export function matchLetter(input: Stroke[], letter: string | Letter, tol: Partial<Tolerance> = {}): LetterScore {
  const L = typeof letter === 'string' ? getLetter(letter) : letter;
  if (!L) throw new Error(`Unknown letter: ${String(letter)}`);
  const targets = [...L.strokes].sort((a, b) => a.order - b.order).map(orientedPoints);
  const n = Math.min(input.length, targets.length);
  const strokes: StrokeScore[] = [];
  for (let i = 0; i < n; i++) strokes.push(scoreStroke(input[i], targets[i], tol));
  const strokeCountOk = input.length === L.strokes.length;
  const sum = strokes.reduce((s, r) => s + r.confidence, 0);
  const countRatio = Math.min(input.length, L.strokes.length) / Math.max(input.length, L.strokes.length, 1);
  const confidence = L.strokes.length ? (sum / L.strokes.length) * countRatio : 0;
  const pass = strokeCountOk && strokes.every((s) => s.pass);
  return { confidence, pass, strokeCountOk, strokes };
}
