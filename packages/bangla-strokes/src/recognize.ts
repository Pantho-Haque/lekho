import type { RecognizeResult, Stroke, Tolerance } from './types';
import { normalize as normalizeStrokes } from './geometry';
import { listLetters } from './letters';
import { matchLetter } from './score';

export interface RecognizeOptions {
  /** Restrict to these chars. Default: every known letter. */
  candidates?: string[];
  /** Max results. Default 5. */
  limit?: number;
  /** Fit the input into the 0–100 box first. Default true; set false if input is already in letter space. */
  normalize?: boolean;
  tolerance?: Partial<Tolerance>;
}

/** Rank known letters by how well `input` matches them. Heuristic, order-aware. */
export function recognize(input: Stroke[], opts: RecognizeOptions = {}): RecognizeResult[] {
  const { limit = 5, normalize = true, tolerance } = opts;
  if (input.length === 0) return [];
  const strokes = normalize ? normalizeStrokes(input) : input;
  const pool = opts.candidates
    ? listLetters().filter((l) => opts.candidates!.includes(l.char))
    : listLetters();
  const results: RecognizeResult[] = [];
  for (const L of pool) {
    if (Math.abs(L.strokes.length - strokes.length) > 1) continue;
    const r = matchLetter(strokes, L, tolerance);
    results.push({ char: L.char, confidence: r.confidence });
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, limit);
}
