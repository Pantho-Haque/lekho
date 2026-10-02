export type * from './types';
export { strokeLength, resample, simplify, boundingBox, normalize, strokeToPath } from './geometry';
export type { Box } from './geometry';
export { getLetter, listLetters, getStrokes } from './letters';
export { scoreStroke, matchLetter, DEFAULT_TOLERANCE } from './score';
export { recognize } from './recognize';
export { inferDirection, opposite, orientedPoints } from './direction';
export { strokeGuide, guidesFromPoints, getStrokeGuides, getLesson } from './guides';
export type { RecognizeOptions } from './recognize';
