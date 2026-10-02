import { describe, expect, it } from 'vitest';
import { matchLetter, scoreStroke } from '../src/score';
import { getLetter, getStrokes } from '../src/letters';
import type { Stroke } from '../src/types';

const target: Stroke = [[20, 20], [50, 30], [80, 80]];
// a loop: circle + tail, as in অ / ঐ
const loop: Stroke = Array.from({ length: 40 }, (_, i) => {
  const t = (i / 39) * Math.PI * 1.8;
  return [50 + 20 * Math.cos(t), 50 + 20 * Math.sin(t)] as [number, number];
});
const jitter = (s: Stroke, amp = 2): Stroke => s.map(([x, y], i) => [x + amp * Math.sin(i * 7.3), y + amp * Math.cos(i * 3.1)]);

describe('scoreStroke', () => {
  it('passes a traced copy with high confidence', () => {
    const r = scoreStroke(jitter(target, 1.5), target);
    expect(r.pass).toBe(true);
    expect(r.confidence).toBeGreaterThan(0.85);
  });

  it('fails a reversed stroke on direction', () => {
    const r = scoreStroke([...target].reverse(), target);
    expect(r.pass).toBe(false);
    expect(r.direction).toBeLessThan(0.5);
  });

  it('fails an offset copy on shape', () => {
    const r = scoreStroke(target.map(([x, y]) => [x + 20, y + 20]), target);
    expect(r.pass).toBe(false);
    expect(r.shape).toBe(0);
  });

  it('fails a short scribble on the middle', () => {
    const r = scoreStroke([[48, 29], [52, 31], [49, 30], [53, 32]], target);
    expect(r.pass).toBe(false);
  });

  it('passes a correctly traced loop (windowed projection)', () => {
    const r = scoreStroke(jitter(loop, 1), loop);
    expect(r.pass).toBe(true);
    expect(r.direction).toBeGreaterThan(0.9);
  });

  it('fails a loop drawn the other way round', () => {
    const r = scoreStroke([...loop].reverse(), loop);
    expect(r.pass).toBe(false);
  });

  it('rejects degenerate input', () => {
    expect(scoreStroke([[1, 1]], target).pass).toBe(false);
    expect(scoreStroke([], target).confidence).toBe(0);
  });
});

describe('matchLetter', () => {
  it('matches a letter against its own strokes', () => {
    const r = matchLetter(getStrokes('অ').map((s) => jitter(s, 1)), 'অ');
    expect(r.pass).toBe(true);
    expect(r.strokeCountOk).toBe(true);
    expect(r.confidence).toBeGreaterThan(0.85);
  });

  it('penalises missing strokes', () => {
    const L = getLetter('অ')!;
    const r = matchLetter(getStrokes('অ').slice(0, 1), L);
    expect(r.pass).toBe(false);
    expect(r.strokeCountOk).toBe(false);
    expect(r.confidence).toBeLessThan(0.5);
  });

  it('throws on unknown letter', () => {
    expect(() => matchLetter([], 'Z')).toThrow();
  });
});
