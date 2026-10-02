import type { Letter } from '../types';

/**
 * Stroke constants for the 39 Bengali consonants (ব্যঞ্জনবর্ণ) incl. ড় ঢ় য় ৎ ং ঃ ঁ.
 * Drafted by apps/web/scripts/skeleton.mjs (font outline → skeleton → strokes), then reviewed by eye
 * (apps/web/scripts/curate.py): junk connector strokes removed, dots re-added, শ hand-authored.
 * Same box/convention as vowels.ts. Refine in the app's /editor and paste back.
 */
export const CONSONANTS: Letter[] = [
  {
    char: 'ক', name: 'ক', roman: 'kô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[74, 57.5], [80, 55], [79.5, 45.5], [72.5, 38.5], [62, 34.5], [55.5, 34], [45.5, 36], [21, 48.5], [21.5, 54], [35.5, 59], [49, 70.5], [54, 72]] },
      { order: 2, direction: 'down', points: [[55, 23.5], [54, 72]] },
      { order: 3, direction: 'right', points: [[13.5, 23], [86.5, 23]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'খ', name: 'খ', roman: 'khô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[22.5, 24], [20.5, 26.5], [23, 34], [29, 35.5], [35.5, 34.5], [47, 25.5], [50, 27], [51.5, 37.5], [49, 44.5], [43, 49], [32, 53], [29.5, 57], [31.5, 60], [50.5, 68.5], [63.5, 80.5], [69, 82.5]] },
      { order: 2, direction: 'down', points: [[68, 13.5], [69, 21.5], [69, 82.5]] },
      { order: 3, direction: 'right', points: [[69, 21.5], [81.5, 21.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'গ', name: 'গ', roman: 'gô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-left', points: [[69.5, 35], [63, 32.5], [54.5, 24], [46.5, 21], [33, 22], [27, 26], [22, 31.5], [20.5, 38.5], [23.5, 38.5], [23.5, 40.5], [35, 40], [40.5, 41], [45, 44.5], [46.5, 50], [44.5, 60], [35, 68]] },
      { order: 2, direction: 'down', points: [[69, 13.5], [70.5, 23], [70, 85]] },
      { order: 3, direction: 'right', points: [[70, 21.5], [82.5, 21.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ঘ', name: 'ঘ', roman: 'ghô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[28, 16], [25, 27.5], [26, 35], [30, 39], [38, 41], [40, 43.5]] },
      { order: 2, direction: 'down-right', points: [[49, 40], [40, 43.5], [38, 47.5], [29.5, 54.5], [29.5, 61], [44.5, 65], [53, 70], [65, 79.5], [71.5, 81.5]] },
      { order: 3, direction: 'down', points: [[72, 16], [71.5, 81.5]] },
      { order: 4, direction: 'right', points: [[14.5, 15], [85.5, 15]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'ঙ', name: 'ঙ (উঁঅ)', roman: 'ṅô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[17, 39.5], [27, 64.5], [33, 73], [40, 79], [49, 83], [56, 84.5], [68.5, 83.5], [75, 81], [81.5, 74.5], [84.5, 68.5], [85, 57.5], [83, 49], [80, 47.5], [75.5, 49], [63.5, 58], [54.5, 59], [49, 56], [46.5, 44], [47, 30], [49, 23], [52.5, 19], [61.5, 14.5], [68.5, 15], [74, 18.5], [75.5, 25.5], [74, 29.5], [71, 33], [64, 35], [47, 34.5]] },
      { order: 2, direction: 'down-right', points: [[30.5, 20], [40, 28.5], [47, 30]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'চ', name: 'চ', roman: 'cô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[32, 15], [31.5, 62.5], [33, 77], [36, 81.5], [40.5, 84.5], [47, 85], [54.5, 83], [65, 74], [70, 66.5], [73, 54], [71.5, 45.5], [63.5, 40.5], [46.5, 37], [39.5, 32], [32, 29.5]] },
      { order: 2, direction: 'right', points: [[17, 14.5], [83, 14.5]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ছ', name: 'ছ', roman: 'chô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[30, 14], [30, 42], [31.5, 47.5], [34.5, 51], [42, 51.5], [49, 47.5], [52.5, 41.5], [53.5, 30]] },
      { order: 2, direction: 'down', points: [[30, 24.5], [43, 29.5], [59, 29.5], [66, 32], [70.5, 37.5], [72.5, 45.5], [70, 55.5], [63, 63], [51.5, 69], [34.5, 67]] },
      { order: 3, direction: 'down-right', points: [[53, 67.5], [54.5, 72.5], [77, 83]] },
      { order: 4, direction: 'right', points: [[18, 13.5], [82, 13.5]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'জ', name: 'বর্গীয় জ', roman: 'jô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[45.5, 25.5], [37, 38], [35.5, 44.5], [36.5, 49], [42, 52.5], [49, 52.5], [58, 48], [59.5, 49], [61, 54], [60, 62], [57, 67], [51.5, 70.5], [40, 70.5], [32, 67], [24.5, 57.5], [17.5, 38.5]] },
      { order: 2, direction: 'down-right', points: [[55, 25], [56.5, 31], [61.5, 35], [77, 39], [75, 62.5], [77, 74]] },
      { order: 3, direction: 'right', points: [[13.5, 24], [44, 24], [45.5, 25.5], [86.5, 24]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ঝ', name: 'ঝ', roman: 'jhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[13.5, 26], [56.5, 26.5], [55.5, 76]] },
      { order: 2, direction: 'down', points: [[56, 36.5], [50, 37.5], [38, 42], [23.5, 49.5], [20.5, 53], [22, 57.5], [36.5, 62.5], [50, 74], [55.5, 76]] },
      { order: 3, direction: 'down-right', points: [[56.5, 58], [63.5, 60], [69.5, 67], [75.5, 69]] },
      { order: 4, direction: 'down', points: [[75, 19.5], [75.5, 69]] },
      { order: 5, direction: 'right', points: [[76, 26], [86.5, 26]] },
    ],
    parts: [[0],[1],[2],[3],[4]],
  },
  {
    char: 'ঞ', name: 'ঞ (ইঁঅ)', roman: 'ñô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[14, 48], [14, 59], [19, 66], [29, 69], [47.5, 67], [60, 72]] },
      { order: 2, direction: 'down-right', points: [[38, 46.5], [33.5, 44.5], [33, 40], [35.5, 33], [38.5, 29.5], [47, 24.5], [53.5, 24.5], [57.5, 26.5], [61, 35.5], [60, 72]] },
      { order: 3, direction: 'down-right', points: [[61, 35.5], [72.5, 28], [80, 27.5], [83, 29.5], [85.5, 34], [84, 44], [81.5, 46], [77.5, 46.5]] },
      { order: 4, direction: 'down-left', points: [[82.5, 45], [86, 51.5], [86.5, 57], [85, 61.5], [81.5, 64.5], [72.5, 64.5], [61, 58]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'ট', name: 'ট', roman: 'ṭô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[29.5, 14], [31, 20.5], [36.5, 24], [60, 26.5], [63.5, 30.5], [64.5, 38.5]] },
      { order: 2, direction: 'anticlockwise', points: [[37.5, 39], [37.5, 77], [38.5, 82.5], [42, 85.5], [49, 86.5], [53.5, 85], [63.5, 76], [66.5, 67], [66, 61.5], [58.5, 59.5]] },
      { order: 3, direction: 'right', points: [[27.5, 39], [72, 39]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ঠ', name: 'ঠ', roman: 'ṭhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[52, 39.5], [49, 45.5], [49.5, 55.5], [47, 63.5], [40.5, 69], [34, 71], [33, 74.5], [36.5, 81], [40.5, 84.5], [46.5, 86.5], [53.5, 86.5], [59.5, 84], [63.5, 79], [65, 73.5], [65, 65.5], [63, 57], [57.5, 48], [51, 42.5]] },
      { order: 2, direction: 'down', points: [[39.5, 19], [39, 26], [44, 38]] },
      { order: 3, direction: 'right', points: [[28.5, 38.5], [45, 38], [50, 40], [53.5, 38.5], [71.5, 38.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ড', name: 'ড', roman: 'ḍô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[45.5, 21], [46, 47], [49.5, 53.5], [55.5, 54.5], [60, 53], [70.5, 44], [74, 44], [76, 46.5], [78.5, 56.5], [78, 63.5], [74.5, 71], [68, 76], [58.5, 78], [51, 77.5], [38.5, 72.5], [28.5, 60.5], [19.5, 37]] },
      { order: 2, direction: 'right', points: [[14, 20.5], [86, 20.5]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ঢ', name: 'ঢ', roman: 'ḍhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[31.5, 15], [31.5, 69.5], [33, 78.5], [37.5, 83], [47.5, 85], [56.5, 82.5], [63.5, 77.5], [70, 69], [74, 59.5], [74, 48], [70.5, 45.5], [63.5, 44]] },
      { order: 2, direction: 'right', points: [[17, 14.5], [83, 14.5]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ণ', name: 'মূর্ধন্য ণ', roman: 'ṇô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-left', points: [[67.5, 34], [61.5, 32], [52.5, 24], [46, 21.5], [35, 20.5], [27.5, 23.5], [23, 27.5], [21, 33], [21.5, 44], [23.5, 48.5], [29.5, 53.5], [36.5, 55], [39, 54]] },
      { order: 2, direction: 'down', points: [[66.5, 13.5], [67.5, 21.5], [67.5, 85]] },
      { order: 3, direction: 'right', points: [[67.5, 21.5], [80, 21.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ত', name: 'ত', roman: 'tô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[20.5, 37.5], [20, 40], [27, 57.5], [38.5, 71.5], [50.5, 76.5], [62, 76.5], [69.5, 74], [76, 67.5], [78, 59.5], [77.5, 50.5], [74, 42.5], [68, 37.5], [58, 36], [56, 38]] },
      { order: 2, direction: 'right', points: [[14, 22], [86, 22]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'থ', name: 'থ', roman: 'thô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[20.5, 34], [22, 25.5], [29.5, 20.5], [40, 20.5], [48, 26], [51, 33.5], [50.5, 39.5], [48, 44.5], [42, 49.5], [31.5, 53], [29, 57], [31.5, 60.5], [40, 63], [50.5, 69], [62, 80], [68, 81.5]] },
      { order: 2, direction: 'down', points: [[67.5, 13.5], [69, 21.5], [68, 81.5]] },
      { order: 3, direction: 'right', points: [[69, 21.5], [81.5, 21.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'দ', name: 'দ', roman: 'dô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[30.5, 15], [31, 56], [39, 53.5], [47.5, 45.5], [60.5, 36], [68.5, 35.5]] },
      { order: 2, direction: 'down', points: [[68.5, 35.5], [68.5, 43.5], [65.5, 54.5], [65.5, 71.5], [68, 84.5], [74, 87.5]] },
      { order: 3, direction: 'right', points: [[18, 14.5], [81.5, 14.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ধ', name: 'ধ', roman: 'dhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down', points: [[67.5, 31.5], [58.5, 33], [43.5, 39], [36.5, 40], [33, 44], [24, 49], [21.5, 52.5], [22.5, 57.5], [35, 61], [45, 65.5], [60, 78.5], [67, 80.5]] },
      { order: 2, direction: 'down', points: [[41, 16], [32.5, 16.5], [27, 22], [28, 31], [34, 37.5], [35, 41.5]] },
      { order: 3, direction: 'down', points: [[68, 16], [67, 80.5]] },
      { order: 4, direction: 'right', points: [[68, 16], [81.5, 15.5]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'ন', name: 'দন্ত্য ন', roman: 'nô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'right', points: [[31.5, 46], [36, 39.5], [43.5, 40], [53.5, 44.5], [63.5, 53.5], [71, 56]] },
      { order: 2, direction: 'down', points: [[71.5, 15], [71.5, 84]] },
      { order: 3, direction: 'right', points: [[14.5, 14.5], [85, 14.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'প', name: 'প', roman: 'pô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[37, 55], [35, 44.5], [29.5, 40.5], [19, 40], [19, 34], [24, 28], [33, 22.5], [42.5, 21.5], [50.5, 23], [60.5, 30.5], [61.5, 35], [43.5, 53], [37, 55]] },
      { order: 2, direction: 'down', points: [[72.5, 14.5], [74, 23], [74, 84]] },
      { order: 3, direction: 'right', points: [[74, 22.5], [86, 22.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ফ', name: 'ফ', roman: 'phô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[20.5, 24], [21, 29.5], [33.5, 36], [37, 38.5], [38, 41.5], [36.5, 44], [23, 51], [23, 56.5], [40, 63.5], [49.5, 71.5], [55.5, 73]] },
      { order: 2, direction: 'clockwise', points: [[74, 57.5], [80.5, 55], [80.5, 48.5], [77.5, 43], [67.5, 36.5], [56.5, 35], [55.5, 73]] },
      { order: 3, direction: 'right', points: [[13.5, 24], [86.5, 24]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ব', name: 'ব', roman: 'bô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down', points: [[71, 28.5], [61.5, 29.5], [45, 36.5], [27.5, 45.5], [24, 50], [25, 55], [45.5, 62.5], [55.5, 69.5], [63, 77.5], [70.5, 80.5]] },
      { order: 2, direction: 'down', points: [[71.5, 15], [70.5, 80.5]] },
      { order: 3, direction: 'right', points: [[15, 14.5], [85, 14.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'ভ', name: 'ভ', roman: 'bhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[20, 39.5], [28, 59.5], [39.5, 72.5], [45.5, 75.5], [56, 77.5], [64.5, 76], [70.5, 73], [74, 69], [77, 60], [76.5, 50], [73, 42], [67.5, 42], [62.5, 47.5], [55.5, 50.5], [50.5, 50.5], [47.5, 44.5]] },
      { order: 2, direction: 'right', points: [[14, 22], [86, 22]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ম', name: 'ম', roman: 'mô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down', points: [[22, 15], [23, 23], [30, 25], [35.5, 29], [39, 33], [42, 40], [42.5, 51.5], [35, 58.5]] },
      { order: 2, direction: 'right', points: [[40, 54.5], [44, 53.5], [52, 55], [64.5, 65], [71, 67]] },
      { order: 3, direction: 'down', points: [[72, 15], [71.5, 84]] },
      { order: 4, direction: 'right', points: [[14.5, 15], [85, 15]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'য', name: 'অন্তঃস্থ য', roman: 'jô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[25.5, 16], [24.5, 22.5], [46, 34], [48, 39], [46, 42], [28.5, 51], [27.5, 53.5], [28.5, 59], [50, 67], [65, 79], [71.5, 81]] },
      { order: 2, direction: 'down', points: [[72.5, 15.5], [71.5, 81]] },
      { order: 3, direction: 'right', points: [[14.5, 15.5], [85, 15.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'র', name: 'র', roman: 'rô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down', points: [[70.5, 28], [62.5, 29.5], [47, 35.5], [27.5, 45.5], [24, 49], [25.5, 54.5], [44, 61.5], [56.5, 70], [63.5, 77.5], [70, 80]] },
      { order: 2, direction: 'down', points: [[71, 15], [70, 80]] },
      { order: 3, direction: 'down-right', points: [[35, 80], [39, 84]] },
      { order: 4, direction: 'right', points: [[15, 14.5], [84.5, 14.5]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'ল', name: 'ল', roman: 'lô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-left', points: [[74.5, 44], [60.5, 39], [56, 39.5], [48.5, 45], [38, 38.5], [27, 39.5], [21.5, 45.5], [21, 56.5], [25.5, 63.5], [32.5, 65], [34.5, 63.5]] },
      { order: 2, direction: 'down', points: [[74.5, 21], [74.5, 78.5]] },
      { order: 3, direction: 'right', points: [[14, 20.5], [86, 20.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: 'শ', name: 'তালব্য শ', roman: 'shô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[15, 20], [24, 22], [33, 28], [38, 34], [30, 40], [22, 46], [23, 54], [32, 57], [38, 50], [39, 40]] },
      { order: 2, direction: 'clockwise', points: [[39, 40], [48, 42], [57, 48], [54, 56], [45, 56], [39, 50]] },
      { order: 3, direction: 'right', points: [[38, 34], [46, 24], [56, 20], [66, 24], [72, 30]] },
      { order: 4, direction: 'down', points: [[73, 12], [73, 88]] },
      { order: 5, direction: 'right', points: [[73, 20], [85, 20]] },
    ],
    parts: [[0],[1],[2],[3],[4]],
  },
  {
    char: 'ষ', name: 'মূর্ধন্য ষ', roman: 'ṣô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[24, 22.5], [44.5, 33], [48.5, 38], [46, 42], [28, 51.5], [28.5, 59], [50, 67], [65, 79], [71.5, 81]] },
      { order: 2, direction: 'down-right', points: [[48.5, 39], [56.5, 40.5], [64.5, 47], [71.5, 49]] },
      { order: 3, direction: 'down', points: [[72.5, 15.5], [71.5, 81]] },
      { order: 4, direction: 'right', points: [[14.5, 15.5], [85, 15.5]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'স', name: 'দন্ত্য স', roman: 'sô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[20.5, 23.5], [22.5, 23], [27, 25], [36.5, 31], [42.5, 40], [44, 46.5], [47, 49]] },
      { order: 2, direction: 'down-left', points: [[72, 43], [60, 39.5], [56, 40.5], [47, 49], [45, 59], [39, 67], [35, 68.5], [26, 67]] },
      { order: 3, direction: 'down', points: [[72, 16], [72, 83]] },
      { order: 4, direction: 'right', points: [[14.5, 15.5], [85, 15.5]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'হ', name: 'হ', roman: 'hô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down', points: [[38, 14.5], [41.5, 28.5], [53.5, 28.5], [61.5, 31.5], [66.5, 37.5], [68, 47], [66.5, 52.5], [57.5, 60.5], [46.5, 63.5], [33, 62]] },
      { order: 2, direction: 'down-right', points: [[48, 63], [47.5, 64.5], [50.5, 69], [76, 84]] },
      { order: 3, direction: 'right', points: [[21.5, 14], [78, 14]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: '\u09dc', name: 'ড় (ড-এ শূন্য ড়)', roman: 'ṛô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[46, 14], [46, 37], [49, 44.5], [58, 45], [71.5, 35], [75.5, 38.5], [77.5, 48.5], [76.5, 55.5], [74, 61.5], [69.5, 65], [64.5, 67.5], [52.5, 68.5], [41, 64.5], [29, 51], [20.5, 29.5]] },
      { order: 2, direction: 'down-right', points: [[53, 82], [57, 86]] },
      { order: 3, direction: 'right', points: [[15, 13.5], [84.5, 13.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: '\u09dd', name: 'ঢ় (ঢ-এ শূন্য ঢ়)', roman: 'ṛhô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[35.5, 14], [35, 54], [36, 61.5], [39.5, 67], [45.5, 69], [53, 67.5], [58.5, 64.5], [66, 56], [69, 48], [69, 40], [60.5, 36.5]] },
      { order: 2, direction: 'down-right', points: [[53, 82], [57, 86]] },
      { order: 3, direction: 'right', points: [[24, 13.5], [76, 13.5]] },
    ],
    parts: [[0],[1],[2]],
  },
  {
    char: '\u09df', name: 'য় (অন্তঃস্থ অ)', roman: 'ẏô', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[25.5, 15], [25.5, 20], [27.5, 22.5], [41.5, 29.5], [48, 35.5], [46.5, 40], [37, 44], [28.5, 50.5], [28.5, 56.5], [50.5, 65], [65, 77], [71.5, 78.5]] },
      { order: 2, direction: 'down', points: [[72, 14.5], [71.5, 78.5]] },
      { order: 3, direction: 'down-right', points: [[38, 80], [42, 84]] },
      { order: 4, direction: 'right', points: [[15, 14], [85, 14]] },
    ],
    parts: [[0],[1],[2],[3]],
  },
  {
    char: 'ৎ', name: 'খণ্ড ত', roman: 't', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[34, 22.5], [36, 24], [37, 31], [42.5, 37.5], [48, 39.5], [54.5, 39.5], [59, 38], [63, 32.5], [62, 21.5], [56.5, 16], [52, 14.5], [38.5, 15.5], [34, 22.5], [27.5, 25.5], [25, 34], [25.5, 41], [28, 48], [33, 53], [65.5, 71.5], [70.5, 76], [73, 81]] },
    ],
    parts: [[0]],
  },
  {
    char: 'ং', name: 'অনুস্বার', roman: 'ṅ', group: 'consonant',
    strokes: [
      { order: 1, direction: 'clockwise', points: [[52, 14.5], [58, 20], [59, 25], [58, 32.5], [53.5, 37], [50.5, 38.5], [39.5, 37], [34.5, 31], [35.5, 19.5], [41, 14.5], [52, 14.5]] },
      { order: 2, direction: 'down-right', points: [[37.5, 54.5], [53.5, 69], [65, 84]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ঃ', name: 'বিসর্গ', roman: 'ḥ', group: 'consonant',
    strokes: [
      { order: 1, direction: 'anticlockwise', points: [[41.5, 16.5], [38, 20.5], [36.5, 26], [36.5, 31], [39.5, 36.5], [44, 39.5], [50, 40.5], [56.5, 39.5], [60, 37], [63.5, 29.5], [63, 22.5], [60.5, 18.5], [57.5, 15.5], [52, 14], [45.5, 14.5], [41.5, 16.5]] },
      { order: 2, direction: 'clockwise', points: [[58, 61], [61.5, 64.5], [63.5, 69.5], [63, 77], [61, 81], [53.5, 85], [42, 83.5], [36.5, 76], [37.5, 66], [40.5, 62], [45.5, 59.5], [52, 59], [58, 61]] },
    ],
    parts: [[0],[1]],
  },
  {
    char: 'ঁ', name: 'চন্দ্রবিন্দু', roman: '̃', group: 'consonant',
    strokes: [
      { order: 1, direction: 'down-right', points: [[48, 36], [52, 40]] },
      { order: 2, direction: 'right', points: [[21, 36], [19, 38.5], [20.5, 44], [26.5, 54.5], [35, 61], [48, 63.5], [60, 63], [70.5, 57.5], [77, 49], [80.5, 38.5], [84, 36]] },
    ],
    parts: [[0],[1]],
  },
];
