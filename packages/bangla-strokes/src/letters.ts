import type { Letter, LetterGroup, Stroke } from './types';
import { VOWELS } from './data/vowels';
import { CONSONANTS } from './data/consonants';
import { DIGITS } from './data/digits';
import { orientedPoints } from './direction';

const ALL: Letter[] = [...VOWELS, ...CONSONANTS, ...DIGITS];
// ড়/ঢ়/য় exist both precomposed (U+09DC…) and as base+nukta; NFC maps both to the same form.
const norm = (c: string) => c.normalize('NFC');
const BY_CHAR = new Map(ALL.map((l) => [norm(l.char), l]));

export function getLetter(char: string): Letter | undefined {
  return BY_CHAR.get(norm(char));
}

export function listLetters(group?: LetterGroup): Letter[] {
  return group ? ALL.filter((l) => l.group === group) : ALL.slice();
}

/** Point arrays in writing order and authored direction (what the scorer compares against). */
export function getStrokes(char: string): Stroke[] {
  const l = getLetter(char);
  if (!l) throw new Error(`Unknown letter: ${char}`);
  return [...l.strokes].sort((a, b) => a.order - b.order).map(orientedPoints);
}
