import { describe, expect, it } from 'vitest';
import { boundingBox, normalize, resample, simplify, strokeLength, strokeToPath } from '../src/geometry';
import type { Stroke } from '../src/types';

const line: Stroke = [[0, 0], [100, 0]];

describe('geometry', () => {
  it('strokeLength', () => {
    expect(strokeLength(line)).toBe(100);
    expect(strokeLength([[0, 0], [3, 4]])).toBe(5);
  });

  it('resample spaces points evenly and keeps endpoints', () => {
    const r = resample([[0, 0], [10, 0], [10, 10]], 5);
    expect(r.length).toBe(5);
    expect(r[0]).toEqual([0, 0]);
    expect(r[4]).toEqual([10, 10]);
    expect(r[2]).toEqual([10, 0]);
    for (let i = 1; i < r.length; i++) expect(strokeLength([r[i - 1], r[i]])).toBeCloseTo(5);
  });

  it('simplify collapses a straight 200-point line to 2 points, keeps endpoints', () => {
    const pts: Stroke = Array.from({ length: 200 }, (_, i) => [i / 2, 0.2 * Math.sin(i)] as [number, number]);
    const s = simplify(pts, 1);
    expect(s.length).toBe(2);
    expect(s[0]).toEqual(pts[0]);
    expect(s[1]).toEqual(pts[199]);
  });

  it('simplify keeps a corner', () => {
    const s = simplify([[0, 0], [5, 0], [10, 0], [10, 5], [10, 10]], 1);
    expect(s).toEqual([[0, 0], [10, 0], [10, 10]]);
  });

  it('boundingBox + normalize fit any box into 0–100 with padding', () => {
    const big: Stroke[] = [[[200, 300], [400, 300]], [[200, 300], [200, 700]]];
    expect(boundingBox(big)).toEqual({ x: 200, y: 300, w: 200, h: 400 });
    const n = normalize(big, 10);
    const b = boundingBox(n);
    expect(b.y).toBeCloseTo(10);
    expect(b.h).toBeCloseTo(80);
    expect(b.w).toBeCloseTo(40);
    expect(b.x).toBeCloseTo(30); // centred horizontally
  });

  it('strokeToPath', () => {
    expect(strokeToPath([[1.234, 2], [3, 4.56]])).toBe('M 1.2 2 L 3 4.6');
    expect(strokeToPath([])).toBe('');
  });
});
