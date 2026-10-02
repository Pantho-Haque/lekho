import type { Direction, Point } from './types';

/**
 * Classify a stroke's writing direction from its points.
 * Loops (net displacement small compared to length) → clockwise / anticlockwise (screen coords, y down).
 * Everything else → one of 8 compass directions of the start→end vector.
 */
export function inferDirection(points: Point[]): Direction {
  if (points.length < 2) return 'right';
  let len = 0, area = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    area += points[i - 1][0] * points[i][1] - points[i][0] * points[i - 1][1];
  }
  const [x0, y0] = points[0], [x1, y1] = points[points.length - 1];
  const dx = x1 - x0, dy = y1 - y0;
  if (Math.hypot(dx, dy) < 0.35 * len) return area > 0 ? 'clockwise' : 'anticlockwise';
  const a = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, 90 = down (y grows downward)
  const sector = Math.round(a / 45);
  return (['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'] as const)[((sector % 8) + 8) % 8];
}

const OPPOSITE: Record<Direction, Direction> = {
  right: 'left', left: 'right', down: 'up', up: 'down',
  'down-right': 'up-left', 'up-left': 'down-right', 'down-left': 'up-right', 'up-right': 'down-left',
  clockwise: 'anticlockwise', anticlockwise: 'clockwise',
};
export const opposite = (d: Direction): Direction => OPPOSITE[d];

/**
 * The points of a stroke oriented to match its authored `direction`.
 * The `direction` field is authoritative: if it is the opposite of what the points imply, the points are
 * reversed, so flipping the label in the data flips the animation, the arrow and the scoring target.
 * Any other disagreement (e.g. 'down' vs 'down-right') keeps the points as stored.
 */
export function orientedPoints(data: { direction: Direction; points: Point[] }): Point[] {
  return inferDirection(data.points) === opposite(data.direction) ? [...data.points].reverse() : data.points;
}
