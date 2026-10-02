import { useMemo, useState } from 'react';
import { guidesFromPoints, inferDirection, listLetters, scoreStroke, simplify, type Letter, type Stroke, type StrokeScore } from '@pantho075/matra';
import StrokeCanvas from '../components/StrokeCanvas';
import glyphs from '../dev/glyphs.json';

const GLYPHS = glyphs as Record<string, string>;

/**
 * DEV-ONLY stroke authoring tool. Draw over the faint font glyph, then "Copy TS" and paste the
 * object into packages/matra/src/data/*.ts. Strokes are the stored constants; the font is
 * only a visual guide here.
 */
export default function Editor() {
  const known = listLetters();
  const q = new URLSearchParams(location.search).get('c');
  const init = known.find((l) => l.char === q) ?? known[0];
  const [char, setChar] = useState(init?.char ?? q ?? 'অ');
  const [name, setName] = useState(init?.name ?? '');
  const [roman, setRoman] = useState(init?.roman ?? '');
  const [strokes, setStrokes] = useState<Stroke[]>(init?.strokes.map((st) => st.points) ?? []);
  const [parts, setParts] = useState(fmtParts(init?.parts ?? []));
  const [test, setTest] = useState(false);
  const [testIdx, setTestIdx] = useState(0);
  const [scores, setScores] = useState<string[]>([]);
  const [glyph, setGlyph] = useState(0.35);
  const [hint, setHint] = useState(0);
  const [play, setPlay] = useState(0);
  const [mode, setMode] = useState<'draw' | 'watch'>('draw');

  const load = (l: Letter) => {
    setChar(l.char); setName(l.name); setRoman(l.roman);
    setStrokes(l.strokes.map((s) => s.points.map((p) => [...p] as [number, number])));
    setParts(fmtParts(l.parts)); setScores([]); setTestIdx(0);
  };

  const onDraw = (pts: Stroke) => {
    if (test) {
      const r = scoreStroke(pts, strokes[testIdx]);
      setScores((s) => [fmtScore(testIdx, r), ...s].slice(0, 8));
      if (r.pass) setTestIdx((i) => (i + 1) % strokes.length);
      return;
    }
    setStrokes((s) => [...s, simplify(pts.map(([x, y]) => [round(x), round(y)]), 1.0)]);
  };

  const guides = useMemo(() => guidesFromPoints(strokes), [strokes]);
  const ts = useMemo(() => {
    const p = parseParts(parts, strokes.length);
    return `  {\n    char: '${char}', name: '${name}', roman: '${roman}', group: 'vowel',\n    strokes: [\n${strokes
      .map((s, i) => `      { order: ${i + 1}, direction: '${inferDirection(s)}', points: [${s.map(([x, y]) => `[${round(x)}, ${round(y)}]`).join(', ')}] },`)
      .join('\n')}\n    ],\n    parts: ${JSON.stringify(p)},\n  },`;
  }, [char, name, roman, strokes, parts]);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= strokes.length) return;
    const s = strokes.slice(); [s[i], s[j]] = [s[j], s[i]]; setStrokes(s);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-[420px_minmax(0,1fr)]">
      <div>
        {(() => {
          const underlay = GLYPHS[char.normalize('NFC')] ? <path d={GLYPHS[char.normalize('NFC')]} fill="#3050d0" opacity={glyph} /> : null;
          return mode === 'watch'
            ? <StrokeCanvas strokes={guides} mode="watch" showNumbers playToken={play} underlay={underlay} />
            : <StrokeCanvas strokes={guides} mode={test ? 'trace' : 'free'} showArrow={test} activeStroke={testIdx} completed={test ? testIdx : strokes.length}
                showNumbers={!test} showGhost={test} hintToken={hint} onStroke={onDraw} underlay={underlay} />;
        })()}
        {!GLYPHS[char.normalize('NFC')] && <p className="mt-2 text-xs text-amber-400">No outline for “{char}” — add it to CHARS in scripts/glyphs.mjs and run `node scripts/glyphs.mjs`.</p>}
        <label className="mt-3 block text-xs text-neutral-400">outline opacity <input type="range" min="0" max="1" step="0.02" value={glyph} onChange={(e) => setGlyph(+e.target.value)} className="w-full" /></label>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="btn" onClick={() => setMode(mode === 'draw' ? 'watch' : 'draw')}>{mode === 'draw' ? '▶ watch' : '✎ draw'}</button>
          {mode === 'watch' && <button className="btn" onClick={() => setPlay((p) => p + 1)}>↺ replay</button>}
          <button className={`btn ${test ? 'ring-accent text-accent' : ''}`} onClick={() => { setTest(!test); setTestIdx(0); setScores([]); }}>⚖ test {test ? 'on' : 'off'}</button>
          {test && <button className="btn" onClick={() => setHint((h) => h + 1)}>hint</button>}
          <button className="btn" onClick={() => setStrokes(strokes.slice(0, -1))}>undo</button>
          <button className="btn" onClick={() => setStrokes([])}>clear</button>
        </div>
        {test && <pre className="mt-3 max-h-48 overflow-auto rounded bg-panel p-2 text-[11px] text-neutral-300">{scores.join('\n') || 'draw stroke ' + (testIdx + 1)}</pre>}
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-1">
          {known.map((l) => <button key={l.char} className={`btn ${l.char === char ? 'ring-accent text-accent' : ''}`} onClick={() => load(l)}>{l.char}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className="inp" value={char} onChange={(e) => setChar(e.target.value)} placeholder="char" />
          <input className="inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="name" />
          <input className="inp" value={roman} onChange={(e) => setRoman(e.target.value)} placeholder="roman" />
        </div>
        <label className="block">parts (stroke indices, groups separated by |)
          <input className="inp mt-1 w-full" value={parts} onChange={(e) => setParts(e.target.value)} placeholder="0,1|2|3" />
        </label>
        <ol className="space-y-1">
          {strokes.map((s, i) => (
            <li key={i} className="flex items-center gap-2 rounded bg-panel px-2 py-1">
              <span className="w-6 text-accent">{i + 1}</span>
              <span className="flex-1 truncate text-neutral-400">{s.length} pts · {inferDirection(s)} · {s[0].join(',')} → {s[s.length - 1].join(',')}</span>
              <button className="btn" onClick={() => move(i, -1)}>↑</button>
              <button className="btn" onClick={() => move(i, 1)}>↓</button>
              <button className="btn" onClick={() => setStrokes(strokes.map((x, k) => k === i ? [...x].reverse() : x))} title="reverse direction">⇄</button>
              <button className="btn text-active" onClick={() => setStrokes(strokes.filter((_, k) => k !== i))}>✕</button>
            </li>
          ))}
        </ol>
        <div className="flex gap-2">
          <button className="btn ring-accent text-accent" onClick={() => navigator.clipboard.writeText(ts)}>Copy TS</button>
          <button className="btn" onClick={async () => {
            try { const l = JSON.parse(await navigator.clipboard.readText()) as Letter; load(l); } catch { alert('clipboard must hold a Letter JSON'); }
          }}>Paste JSON</button>
        </div>
        <pre className="max-h-80 overflow-auto rounded bg-panel p-3 text-[11px] leading-snug text-neutral-300">{ts}</pre>
      </div>
      <style>{`.btn{padding:.25rem .6rem;border-radius:.5rem;background:#1b231d;box-shadow:0 0 0 1px #2a342c inset}.inp{padding:.35rem .5rem;border-radius:.5rem;background:#141a16;box-shadow:0 0 0 1px #2a342c inset}`}</style>
    </div>
  );
}

const round = (n: number) => Math.round(n * 2) / 2;
const fmtParts = (p: number[][]) => p.map((g) => g.join(',')).join('|');
function parseParts(s: string, n: number): number[][] {
  const groups = s.split('|').map((g) => g.split(',').map((x) => parseInt(x.trim(), 10)).filter((x) => !isNaN(x) && x < n)).filter((g) => g.length);
  const covered = new Set(groups.flat());
  const missing = Array.from({ length: n }, (_, i) => i).filter((i) => !covered.has(i));
  return missing.length ? [...groups, ...missing.map((i) => [i])] : groups;
}
const fmtScore = (i: number, r: StrokeScore) =>
  `#${i + 1} ${r.pass ? 'PASS' : 'fail'} conf=${r.confidence.toFixed(2)} start=${r.start.toFixed(2)} end=${r.end.toFixed(2)} shape=${r.shape.toFixed(2)} len=${r.length.toFixed(2)} dir=${r.direction.toFixed(2)}`;
