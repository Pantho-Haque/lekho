import type { Letter } from '../types';

/**
 * Stroke constants for the 11 Bengali vowels (স্বরবর্ণ).
 * Coordinates: 0–100 box, y down. Each letter is fitted to the box (padding ≈10) like the kanji demo.
 * Convention: body strokes first; the মাত্রা (headline), when the letter has one, is the last stroke.
 * Authored against Noto Sans Bengali outlines (apps/web/scripts/glyphs.mjs renders gridded previews);
 * refine with the app's /editor page and paste back here.
 */
export const VOWELS: Letter[] = [
  {
    char: 'অ', name: 'স্বরে অ', roman: 'ô', group: 'vowel',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[15, 36], [15, 48], [21, 59], [33, 66], [47, 67], [59, 62], [65, 52], [63, 41], [55, 33], [44, 30], [36, 34], [34, 42], [39, 46]] },
      { order: 2, direction: 'down-right', points: [[59, 59], [68, 67], [76, 75]] },
      { order: 3, direction: 'down', points: [[77, 25], [77, 77]] },
      { order: 4, direction: 'right', points: [[10, 25], [90, 25]] },
    ],
    parts: [[0, 1], [2], [3]],
  },
  {
    char: 'আ', name: 'স্বরে আ', roman: 'a', group: 'vowel',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[14, 42], [14, 53], [20, 62], [31, 68], [44, 69], [54, 63], [58, 52], [55, 41], [46, 36], [37, 36], [31, 41], [31, 48], [35, 50]] },
      { order: 2, direction: 'down-right', points: [[50, 62], [56, 67], [62, 72]] },
      { order: 3, direction: 'down', points: [[62, 32], [62, 73]] },
      { order: 4, direction: 'down', points: [[80, 27], [80, 73]] },
      { order: 5, direction: 'right', points: [[10, 32], [90, 32]] },
    ],
    parts: [[0, 1], [2], [3], [4]],
  },
  {
    char: 'ই', name: 'হ্রস্ব ই', roman: 'i', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[33, 10], [30, 17], [33, 23], [42, 26], [55, 27], [60, 30], [60, 36]] },
      { order: 2, direction: 'clockwise', points: [[40, 52], [36, 46], [40, 40], [50, 42], [60, 49], [61, 59], [53, 67], [42, 70], [33, 67]] },
      { order: 3, direction: 'down-right', points: [[33, 68], [47, 73], [60, 79], [72, 86]] },
      { order: 4, direction: 'right', points: [[27, 36], [72, 36]] },
    ],
    parts: [[0], [1, 2], [3]],
  },
  {
    char: 'ঈ', name: 'দীর্ঘ ঈ', roman: 'ī', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[27, 10], [24, 18], [28, 25], [40, 27], [58, 28], [65, 32], [66, 37]] },
      { order: 2, direction: 'clockwise', points: [[31, 55], [27, 49], [31, 42], [42, 44], [50, 53], [47, 64], [38, 70], [28, 72]] },
      { order: 3, direction: 'down', points: [[66, 48], [61, 60], [62, 72], [66, 82], [69, 88]] },
      { order: 4, direction: 'right', points: [[19, 37], [81, 37]] },
    ],
    parts: [[0], [1], [2], [3]],
  },
  {
    char: 'উ', name: 'হ্রস্ব উ', roman: 'u', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[26, 10], [24, 18], [30, 25], [45, 27], [62, 29], [67, 33], [67, 38]] },
      { order: 2, direction: 'down-right', points: [[45, 42], [45, 55], [50, 62], [60, 61], [68, 55]] },
      { order: 3, direction: 'right', points: [[22, 50], [25, 65], [35, 80], [50, 88], [64, 85], [73, 74], [74, 62], [70, 54]] },
      { order: 4, direction: 'right', points: [[17, 38], [82, 38]] },
    ],
    parts: [[0], [1, 2], [3]],
  },
  {
    char: 'ঊ', name: 'দীর্ঘ ঊ', roman: 'ū', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[28, 10], [26, 18], [33, 25], [50, 27], [68, 29], [72, 33], [72, 38]] },
      { order: 2, direction: 'down-right', points: [[52, 42], [52, 57], [58, 63], [67, 60], [74, 54]] },
      { order: 3, direction: 'right', points: [[20, 50], [26, 66], [38, 80], [55, 88], [70, 84], [78, 72], [78, 60], [74, 54]] },
      { order: 4, direction: 'down-right', points: [[33, 51], [36, 63], [42, 74], [52, 83]] },
      { order: 5, direction: 'right', points: [[13, 38], [87, 38]] },
    ],
    parts: [[0], [1, 2], [3], [4]],
  },
  {
    char: 'ঋ', name: 'ঋ', roman: 'ri', group: 'vowel',
    strokes: [
      { order: 1, direction: 'right', points: [[17, 22], [12, 28], [18, 34], [28, 36], [38, 32], [45, 22], [46, 18]] },
      { order: 2, direction: 'down', points: [[46, 18], [53, 28], [60, 38], [40, 45], [18, 53], [22, 62], [40, 72], [55, 82], [62, 88]] },
      { order: 3, direction: 'down', points: [[63, 10], [63, 88]] },
      { order: 4, direction: 'down-right', points: [[63, 52], [72, 60], [84, 72]] },
      { order: 5, direction: 'down', points: [[85, 10], [85, 80]] },
    ],
    parts: [[0, 1], [2], [3, 4]],
  },
  {
    char: 'এ', name: 'এ', roman: 'e', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[56, 46], [48, 45], [43, 38], [45, 27], [53, 16], [66, 12], [78, 16], [85, 26], [86, 40], [84, 60], [83, 75], [83, 88]] },
      { order: 2, direction: 'down-right', points: [[15, 43], [14, 55], [18, 67], [28, 75], [42, 78], [56, 77], [68, 76], [76, 80], [80, 86]] },
    ],
    parts: [[0], [1]],
  },
  {
    char: 'ঐ', name: 'ঐ', roman: 'oi', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[40, 10], [39, 18], [45, 24], [58, 26], [72, 29], [80, 36], [80, 46], [74, 53], [68, 57]] },
      { order: 2, direction: 'down-right', points: [[46, 58], [39, 56], [37, 47], [43, 38], [55, 35], [64, 40], [66, 50], [66, 65], [66, 80], [66, 88]] },
      { order: 3, direction: 'down-right', points: [[18, 57], [18, 70], [25, 78], [38, 82], [52, 80], [62, 84]] },
    ],
    parts: [[0], [1], [2]],
  },
  {
    char: 'ও', name: 'ও', roman: 'o', group: 'vowel',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[47, 42], [41, 38], [42, 28], [50, 19], [62, 14], [76, 14], [85, 22], [87, 34], [80, 46], [70, 50]] },
      { order: 2, direction: 'down-right', points: [[15, 28], [20, 42], [28, 58], [40, 74], [54, 84], [68, 88], [80, 84], [87, 74], [87, 62], [78, 52], [67, 50]] },
    ],
    parts: [[0], [1]],
  },
  {
    char: 'ঔ', name: 'ঔ', roman: 'ou', group: 'vowel',
    strokes: [
      { order: 1, direction: 'down-right', points: [[42, 10], [41, 18], [47, 24], [60, 25], [74, 28], [84, 36], [84, 46], [78, 54], [70, 58]] },
      { order: 2, direction: 'right', points: [[41, 55], [36, 49], [39, 41], [48, 36], [60, 36], [68, 42], [70, 52], [65, 60]] },
      { order: 3, direction: 'right', points: [[17, 47], [22, 60], [32, 76], [46, 86], [60, 88], [70, 82], [72, 72], [66, 62], [56, 62]] },
    ],
    parts: [[0], [1], [2]],
  },
];
