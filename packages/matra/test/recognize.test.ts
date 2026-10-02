import { describe, expect, it } from 'vitest';
import { recognize } from '../src/recognize';
import { matchLetter } from '../src/score';
import { getLetter, listLetters, getStrokes } from '../src/letters';
import { inferDirection, opposite, orientedPoints } from '../src/direction';
import { getLesson, getStrokeGuides, guidesFromPoints } from '../src/guides';

const DIRECTIONS = ['right', 'left', 'down', 'up', 'down-right', 'down-left', 'up-right', 'up-left', 'clockwise', 'anticlockwise'];
import type { Stroke } from '../src/types';

const jitter = (s: Stroke, amp = 2): Stroke => s.map(([x, y], i) => [x + amp * Math.sin(i * 7.3), y + amp * Math.cos(i * 3.1)]);

describe('letters', () => {
  it('exposes 11 vowels, 39 consonants, 10 digits with sane data', () => {
    expect(listLetters('vowel').map((l) => l.char).join('')).toBe('অআইঈউঊঋএঐওঔ');
    expect(listLetters('consonant').length).toBe(39);
    expect(listLetters('digit').map((l) => l.char).join('')).toBe('০১২৩৪৫৬৭৮৯');
    expect(getLetter('ড়')?.char).toBe(getLetter('\u09dc')?.char); // base+nukta and precomposed resolve alike
    for (const l of listLetters()) {
      expect(l.strokes.length).toBeGreaterThan(0);
      expect(l.name).not.toBe('');
      l.strokes.forEach((s, i) => {
        expect(s.order).toBe(i + 1); // arrays are stored in writing order
        expect(DIRECTIONS).toContain(s.direction);
      });
      for (const { points: s } of l.strokes) {
        expect(s.length).toBeGreaterThanOrEqual(2);
        for (const [x, y] of s) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(100); expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(100); }
      }
      expect(l.parts.flat().sort((a, b) => a - b)).toEqual(l.strokes.map((_, i) => i)); // parts cover every stroke once
    }
  });
  it('getStrokes throws on unknown', () => {
    expect(() => getStrokes('x')).toThrow();
    expect(getLetter('x')).toBeUndefined();
  });
});

describe('recognize', () => {
  it('returns a letter first for its own strokes', () => {
    const r = recognize(getStrokes('অ'), { normalize: false });
    expect(r[0].char).toBe('অ');
  });

  it('is scale/position invariant when normalize is on', () => {
    const scaled = getStrokes('এ').map((s) => s.map(([x, y]) => [x * 3 + 500, y * 3 + 200] as [number, number]));
    const r = recognize(scaled);
    expect(r[0].char).toBe('এ');
  });

  it('keeps the right letter in the top 3 under jitter', () => {
    for (const ch of ['অ', 'আ', 'ই', 'উ', 'এ', 'ও']) {
      const r = recognize(getStrokes(ch).map((s) => jitter(s, 2)), { normalize: false });
      expect(r.slice(0, 3).map((x) => x.char)).toContain(ch);
    }
  });

  it('empty input → empty result', () => {
    expect(recognize([])).toEqual([]);
  });
});

describe('direction + guides', () => {
  it('inferDirection classifies lines and loops', () => {
    expect(inferDirection([[10, 20], [90, 20]])).toBe('right');
    expect(inferDirection([[50, 10], [50, 90]])).toBe('down');
    expect(inferDirection([[90, 90], [10, 10]])).toBe('up-left');
    const circle = (sign: number): Stroke => Array.from({ length: 40 }, (_, i) => { const t = (sign * i / 39) * Math.PI * 1.9; return [50 + 20 * Math.cos(t), 50 + 20 * Math.sin(t)]; });
    expect(inferDirection(circle(1))).toBe('clockwise');     // y down: increasing angle sweeps clockwise on screen
    expect(inferDirection(circle(-1))).toBe('anticlockwise');
  });

  it('stored directions are consistent with the points (same or opposite), and oriented points match', () => {
    for (const l of listLetters()) for (const s of l.strokes) {
      const inf = inferDirection(s.points);
      expect([inf, opposite(inf)]).toContain(s.direction);
      expect(inferDirection(orientedPoints(s))).toBe(s.direction);
    }
  });

  it('the direction field is authoritative: flipping it reverses the taught stroke everywhere', () => {
    const base = getLetter('অ')!;
    const flipped = { ...base, strokes: base.strokes.map((s, i) => (i === 0 ? { ...s, direction: opposite(s.direction) } : s)) };
    const basePts = orientedPoints(base.strokes[0]);
    const g = getStrokeGuides(flipped)[0];
    expect(g.points[0]).toEqual(basePts[basePts.length - 1]);
    expect(inferDirection(g.points)).toBe(flipped.strokes[0].direction);
    // scoring follows the flipped orientation too
    expect(matchLetter([g.points, ...getStrokes('অ').slice(1)], flipped).strokes[0].pass).toBe(true);
    expect(matchLetter([basePts, ...getStrokes('অ').slice(1)], flipped).strokes[0].pass).toBe(false);
  });

  it('getLesson returns ordered guides with render data', () => {
    const les = getLesson('অ');
    expect(les.strokes.map((g) => g.order)).toEqual([1, 2, 3, 4]);
    expect(les.strokes[3].path).toBe('M 10 25 L 90 25');
    expect(les.strokes[2].angle).toBeCloseTo(90); // stem goes down
    expect(les.strokes[3].label[1]).toBeLessThan(25); // headline number sits above the line
    expect(les.parts.length).toBe(3);
    expect(les.parts[0].strokes.map((g) => g.index)).toEqual([0, 1]);
    expect(les.hasParts).toBe(true);
    expect(getLesson('০').hasParts).toBe(false);
  });

  it('getStrokeGuides sorts by order even if data were out of order', () => {
    const L = { ...getLetter('অ')!, strokes: [...getLetter('অ')!.strokes].reverse() };
    expect(getStrokeGuides(L).map((g) => g.order)).toEqual([1, 2, 3, 4]);
  });

  it('guidesFromPoints infers order and direction', () => {
    const g = guidesFromPoints([[[10, 20], [90, 20]]]);
    expect(g[0]).toMatchObject({ order: 1, direction: 'right', index: 0, length: 80 });
  });
});
