import { useMemo, useState } from 'react';
import type { Lesson } from '@pantho075/matra';
import StrokeCanvas from './StrokeCanvas';
import { S } from '../lib/strings';

/** Deterministic shuffle so tile order is stable for a given letter, never already in order. */
function shuffled(n: number, seed: string): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (n > 1 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

export default function PartsBuilder({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const order = useMemo(() => shuffled(lesson.parts.length, lesson.letter.char), [lesson]);
  const [tapped, setTapped] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [ok, setOk] = useState(false);

  const placed = tapped.flatMap((p) => lesson.parts[p].strokeIndices);
  const remaining = order.filter((p) => !tapped.includes(p));

  const check = () => {
    if (tapped.length === lesson.parts.length && tapped.every((p, i) => p === i)) { setOk(true); onDone(); }
    else setError(true);
  };
  const reset = () => { setTapped([]); setError(false); setOk(false); };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-56">
        <StrokeCanvas strokes={lesson.strokes} mode="free" doneStrokes={placed} showGhost ghostOpacity={0.6} error={error} className="pointer-events-none" />
      </div>

      {remaining.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {remaining.map((p) => (
            <button key={p} data-part={p} onClick={() => { setTapped([...tapped, p]); setError(false); }}
              className="w-20 rounded-xl shadow-md transition active:scale-95">
              <StrokeCanvas strokes={lesson.strokes} mode="free" doneStrokes={lesson.parts[p].strokeIndices} showGhost ghostOpacity={0.35} className="pointer-events-none" />
            </button>
          ))}
        </div>
      ) : (
        <button onClick={reset} className="text-sm text-neutral-400">↺ {S.reset}</button>
      )}

      {error && <p className="text-center text-sm text-active">{S.wrongOrder}</p>}

      <button onClick={check} disabled={remaining.length > 0 || ok}
        data-testid="check" className="rounded-2xl bg-accent/15 px-10 py-3 font-semibold text-accent ring-1 ring-accent/40 disabled:opacity-40">
        {S.check}
      </button>
    </div>
  );
}
