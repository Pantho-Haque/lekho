import type { Letter, Lesson, PartGuide, Point, Stroke, StrokeData, StrokeGuide } from './types';
import { strokeLength, strokeToPath } from './geometry';
import { inferDirection, orientedPoints } from './direction';
import { getLetter } from './letters';

/** Derive render data for one stroke. `index` is its 0-based position in the letter. */
export function strokeGuide(data: StrokeData, index: number): StrokeGuide {
  const pts = orientedPoints(data);
  const start = pts[0], end = pts[pts.length - 1];
  const next = pts[Math.min(1, pts.length - 1)];
  const dx = next[0] - start[0], dy = next[1] - start[1], L = Math.hypot(dx, dy) || 1;
  // number sits 7 units off the start on the stroke's left-hand side (above a rightward stroke), pulled 3 units back
  const label: Point = [start[0] + (dy / L) * 7 - (dx / L) * 3, start[1] - (dx / L) * 7 - (dy / L) * 3];
  return {
    ...data,
    points: pts,
    index,
    path: strokeToPath(pts),
    start, end, label,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    length: strokeLength(pts),
  };
}

/** Wrap raw point arrays as guides (order = position, direction inferred). Used by authoring tools. */
export function guidesFromPoints(strokes: Stroke[]): StrokeGuide[] {
  return strokes.map((points, i) => strokeGuide({ order: i + 1, direction: inferDirection(points), points }, i));
}

/** Guides for a letter's strokes, sorted by their authored `order`. */
export function getStrokeGuides(letter: string | Letter): StrokeGuide[] {
  const L = typeof letter === 'string' ? getLetter(letter) : letter;
  if (!L) throw new Error(`Unknown letter: ${String(letter)}`);
  return [...L.strokes].sort((a, b) => a.order - b.order).map(strokeGuide);
}

/** Everything the app needs to teach one letter. */
export function getLesson(letter: string | Letter): Lesson {
  const L = typeof letter === 'string' ? getLetter(letter) : letter;
  if (!L) throw new Error(`Unknown letter: ${String(letter)}`);
  const strokes = getStrokeGuides(L);
  const parts: PartGuide[] = L.parts.map((strokeIndices, index) => ({ index, strokeIndices, strokes: strokeIndices.map((i) => strokes[i]) }));
  return { letter: L, strokes, parts, hasParts: parts.length > 1 };
}
