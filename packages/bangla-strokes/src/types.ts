/** A point in a 0–100 box, y grows downward. */
export type Point = [number, number];
/** One pen stroke's centreline: an ordered polyline in writing direction. */
export type Stroke = Point[];

export type LetterGroup = 'vowel' | 'consonant' | 'digit';

/** Writing direction of a stroke. Compass terms are screen-relative (down = towards the baseline). */
export type Direction =
  | 'right' | 'left' | 'down' | 'up'
  | 'down-right' | 'down-left' | 'up-right' | 'up-left'
  | 'clockwise' | 'anticlockwise';

/** A stored stroke: the authored data item. */
export interface StrokeData {
  /** 1-based writing order. Arrays are kept sorted by this; the package validates it. */
  order: number;
  /**
   * Writing direction. Authoritative: if it is the opposite of what `points` imply, the package reverses
   * the points (see `orientedPoints`). So flipping this field flips how the stroke is taught and scored.
   */
  direction: Direction;
  /** Centreline. Read it through `orientedPoints()` / `StrokeGuide.points` to get the taught direction. */
  points: Stroke;
}

export interface Letter {
  /** The character itself, e.g. "অ". */
  char: string;
  /** Bengali name, e.g. "স্বরে অ". */
  name: string;
  /** Romanisation, e.g. "ô". */
  roman: string;
  group: LetterGroup;
  /** Strokes in writing order. Convention: body first, মাত্রা (headline) last as its own stroke. */
  strokes: StrokeData[];
  /** Groups of stroke indices that form visual components, for "build from parts" exercises. */
  parts: number[][];
  /** Optional mnemonic. */
  hint?: string;
}

/** Everything a renderer needs for one stroke; derived by the package from StrokeData. */
export interface StrokeGuide extends StrokeData {
  /** 0-based position in the letter (= order − 1). */
  index: number;
  /** SVG path `d` for the centreline. */
  path: string;
  start: Point;
  end: Point;
  /** Where to draw the order number (offset from the start along the stroke's normal). */
  label: Point;
  /** Heading of the first segment in degrees, 0 = right, 90 = down. For a start arrow. */
  angle: number;
  length: number;
}

export interface PartGuide {
  index: number;
  strokeIndices: number[];
  strokes: StrokeGuide[];
}

/** A letter prepared for teaching: guides for every stroke and every part. */
export interface Lesson {
  letter: Letter;
  strokes: StrokeGuide[];
  parts: PartGuide[];
  /** True when the letter has more than one part (the "build from parts" exercise makes sense). */
  hasParts: boolean;
}

export interface Tolerance {
  /** Max distance (units) between start points. */
  start: number;
  /** Max distance between end points. */
  end: number;
  /** Max mean distance from input points to target. */
  shape: number;
  /** Max mean distance from target points to input (catches partial scribbles). */
  shapeBack: number;
  /** Allowed input/target length ratio. */
  lengthMin: number;
  lengthMax: number;
  /** Min fraction of input points that progress forward along the target. */
  direction: number;
}

export interface StrokeScore {
  /** 0–1 weighted confidence. */
  confidence: number;
  /** True when every sub-score is within tolerance. */
  pass: boolean;
  start: number;
  end: number;
  shape: number;
  length: number;
  direction: number;
}

export interface LetterScore {
  confidence: number;
  pass: boolean;
  strokeCountOk: boolean;
  strokes: StrokeScore[];
}

export interface RecognizeResult {
  char: string;
  confidence: number;
}
