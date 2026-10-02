# @pantho075/matra

Stroke-order data and a deterministic, dependency-free heuristic for scoring and recognising
handwritten **Bengali (Bangla) letters**. No DOM, no canvas: runs in the browser, Node, workers and
React Native.

```bash
npm i @pantho075/matra
```

```ts
import { getLesson, getStrokes, scoreStroke, recognize } from '@pantho075/matra';

const lesson = getLesson('অ');
lesson.strokes[0];
// { order: 1, direction: 'anticlockwise', points: [[15,36], …], index: 0,
//   path: 'M 15 36 L 15 48 …', start: [15,36], end: [39,46], label: [23.6,33], angle: 90, length: 131 }
lesson.parts;                               // [{ index, strokeIndices, strokes }], lesson.hasParts

const drawn = [[12, 35], [14, 50], …];      // the learner's pointer points (same 0–100 box)
scoreStroke(drawn, lesson.strokes[0].points);
// { confidence: 0.91, pass: true, start: 0.95, end: 0.9, shape: 0.88, length: 0.97, direction: 1 }

getStrokes('অ');                            // just the point arrays, in writing order
recognize([drawn, …]);                      // [{ char: 'অ', confidence: 0.84 }, { char: 'আ', … }]
```

## Data format

```ts
type Point  = [number, number];   // 0–100 box, y down
type Stroke = Point[];
type Direction = 'right' | 'left' | 'down' | 'up' | 'down-right' | 'down-left' | 'up-right' | 'up-left'
               | 'clockwise' | 'anticlockwise';
interface StrokeData { order: number; direction: Direction; points: Stroke }   // one authored stroke
// `direction` wins: if it is the opposite of what `points` imply, the package reverses the points
// (orientedPoints), so editing the field flips how the stroke is animated and scored.
interface Letter {
  char: string;                   // "অ"
  name: string;                   // "স্বরে অ"
  roman: string;                  // "ô"
  group: 'vowel' | 'consonant' | 'digit';
  strokes: StrokeData[];          // sorted by order; body first, মাত্রা (headline) last when present
  parts: number[][];              // stroke-index groups that form visual components
  hint?: string;
}
```

Strokes are **hand-authored constants**, not extracted from a font at runtime. Each letter is fitted
to the box with ~10 units of padding, like kanji practice cards. Shipped: 11 vowels, 39 consonants
(incl. ড় ঢ় য় ৎ ং ঃ ঁ), 10 digits. `getLetter` accepts ড়/ঢ়/য় in either precomposed or base+nukta form.

## API

| Function | What it does |
|---|---|
| `getLetter(char)` / `listLetters(group?)` / `getStrokes(char)` | Data access. `getStrokes` returns point arrays in writing order; throws on unknown chars. |
| `getLesson(char)` / `getStrokeGuides(char)` | Render-ready guides: path, start/end, number label position, start-arrow angle, parts. |
| `inferDirection(points)` / `opposite(dir)` / `orientedPoints(data)` / `guidesFromPoints(strokes)` | Direction helpers for authoring tools; `orientedPoints` applies the authoritative `direction`. |
| `scoreStroke(input, target, tol?)` | Score one drawn stroke against one target stroke → `StrokeScore`. |
| `matchLetter(input[], char \| Letter, tol?)` | Order-aware score of a whole drawing → `LetterScore`. |
| `recognize(input[], { candidates?, limit?, normalize?, tolerance? })` | Rank known letters by fit. Input is normalised into the box first unless `normalize: false`. |
| `resample(stroke, n)`, `simplify(stroke, ε)`, `normalize(strokes, pad)`, `boundingBox`, `strokeLength`, `strokeToPath` | Pure geometry helpers. |
| `DEFAULT_TOLERANCE` | The thresholds; pass a partial override to any scoring call. |

### How scoring works

Both strokes are resampled to 64 points by arc length. Each input point is projected onto the
target with a windowed nearest-point search (greedy tracking, so loops in অ/ঐ don't snap to the
wrong pass). Sub-scores, each 0–1:

| sub-score | measures | passes when |
|---|---|---|
| `start`, `end` | endpoint distance | ≤ 15 units |
| `shape` | mean distance input→target **and** target→input | ≤ 8 / ≤ 10 |
| `length` | length ratio | 0.7 – 1.5 |
| `direction` | fraction of forward steps along the target | ≥ 0.85 |

`confidence` is a weighted mean (shape .35, direction .25, start .15, end .15, length .10);
`pass` requires every sub-score within tolerance. All thresholds live in `DEFAULT_TOLERANCE`.

## Adding a letter

Use the `/editor` page of the [lekho](../../apps/web) dev app: it overlays the Noto Sans Bengali
outline, you draw each stroke, it simplifies the points and gives you a `Letter` literal to paste
into `src/data/*.ts`. Convention: body strokes first, headline last. Bare point arrays are fine: run
`node scripts/annotate.mjs` to add `order`/`direction`. Then run the tests and open a PR.

## License

MIT
