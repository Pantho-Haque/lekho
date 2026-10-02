import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLesson, listLetters, scoreStroke, type Stroke } from '@pantho075/matra';
import StrokeCanvas from '../components/StrokeCanvas';
import PartsBuilder from '../components/PartsBuilder';
import { S, DIRECTION, bn } from '../lib/strings';
import { markDone, speak } from '../lib/progress';

const ALL_STEPS = ['watch', 'traceNum', 'traceNoNum', 'parts', 'memory', 'done'] as const;
type Step = (typeof ALL_STEPS)[number];

export default function Learn() {
  const { char = '' } = useParams();
  const nav = useNavigate();
  // the package decides order, direction, labels and parts; the app only renders and scores
  const lesson = useMemo(() => { try { return getLesson(decodeURIComponent(char)); } catch { return undefined; } }, [char]);
  const letter = lesson?.letter;
  const STEPS = useMemo(() => ALL_STEPS.filter((st) => st !== 'parts' || lesson?.hasParts), [lesson]);

  const [stepIdx, setStepIdx] = useState(0);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [fails, setFails] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [ghost, setGhost] = useState(false);
  const [shake, setShake] = useState(false);
  const [playToken, setPlayToken] = useState(1);
  const [hintToken, setHintToken] = useState(0);
  const [toast, setToast] = useState('');

  const step: Step = STEPS[stepIdx];
  const guides = lesson?.strokes ?? [];
  const n = guides.length;

  useEffect(() => { setStepIdx(0); }, [letter?.char]);
  useEffect(() => {
    setStrokeIdx(0); setFails(0); setToast(''); setGhost(false);
    setStepDone(step === 'watch');
    setShowNumbers(step === 'traceNum');
  }, [step]);

  if (!lesson || !letter) return <main className="p-10 text-center">অজানা বর্ণ। <Link className="text-accent" to="/">ফিরে যাও</Link></main>;

  const onStroke = (pts: Stroke) => {
    if (stepDone) return;
    const r = scoreStroke(pts, guides[strokeIdx].points);
    if (r.pass) {
      const next = strokeIdx + 1;
      setFails(0);
      setStrokeIdx(next);
      if (next >= n) { setStepDone(true); setToast(S.awesome); }
    } else {
      setShake(true); setTimeout(() => setShake(false), 350);
      const f = fails + 1;
      if (step === 'memory') setGhost(true);
      if (f >= 3) { setHintToken((t) => t + 1); setFails(0); } else setFails(f);
    }
  };

  const advance = () => {
    if (stepIdx + 1 < STEPS.length) setStepIdx(stepIdx + 1);
  };
  useEffect(() => { if (step === 'done') markDone(letter.char); }, [step, letter.char]);

  const all = listLetters();
  const nextChar = all[(all.findIndex((l) => l.char === letter.char) + 1) % all.length].char;

  const title = step === 'watch' ? S.steps.watch.title(letter.char)
    : step === 'parts' ? S.steps.parts.title(letter.char)
    : step === 'done' ? S.completed : S.steps[step].title;
  const sub = step === 'done' ? S.completedBody(letter.char) : S.steps[step].sub;
  const foot = step === 'done' ? '' : S.steps[step].foot;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      {/* top bar */}
      <header className="flex items-center gap-3 px-4 pt-4">
        <button onClick={() => nav('/')} aria-label="close" className="p-2 text-2xl text-neutral-400">×</button>
        <div className="flex flex-1 gap-1.5">
          {STEPS.slice(0, -1).map((s, i) => (
            <span key={s} className={`h-2 flex-1 rounded-full ${i < stepIdx || (i === stepIdx && stepDone) ? 'bg-accent' : 'bg-neutral-800'}`} />
          ))}
        </div>
        <button onClick={() => speak(letter.name)} aria-label="speak" className="rounded-full bg-neutral-800 p-2 text-sm">🔊</button>
        <span className="text-xl text-accent">{letter.char}</span>
      </header>

      {/* body */}
      <main className="flex flex-1 flex-col items-center px-5 pt-8 pb-32">
        <h1 className="text-center text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-center text-sm text-neutral-400">{sub}</p>

        <div className="relative mt-8 w-full max-w-xs">
          {toast && <div className="pop absolute left-1/2 -top-5 z-10 rounded-full bg-emerald-400 px-6 py-2 text-xl font-bold text-bg shadow-lg">{toast}</div>}

          {step === 'watch' && (
            <StrokeCanvas strokes={guides} mode="watch" showNumbers playToken={playToken} />
          )}
          {(step === 'traceNum' || step === 'traceNoNum') && (
            <StrokeCanvas strokes={guides} mode="trace" activeStroke={strokeIdx} completed={strokeIdx}
              showNumbers={showNumbers} showArrow hintToken={hintToken} onStroke={onStroke} shake={shake} />
          )}
          {step === 'memory' && (
            <StrokeCanvas strokes={guides} mode="free" activeStroke={strokeIdx} completed={strokeIdx}
              showGhost={ghost} ghostOpacity={0.35} showArrow={ghost} hintToken={hintToken} onStroke={onStroke} shake={shake} />
          )}
          {step === 'parts' && <PartsBuilder key={letter.char} lesson={lesson} onDone={() => setStepDone(true)} />}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-5xl text-bg">✓</div>
              <div className="w-40"><StrokeCanvas strokes={guides} mode="watch" playToken={playToken} /></div>
            </div>
          )}
        </div>

        {step === 'watch' && (
          <>
            <button onClick={() => setPlayToken((t) => t + 1)} className="mt-6 rounded-2xl bg-accent/15 px-6 py-2.5 font-semibold text-accent ring-1 ring-accent/40">↺ {S.replay}</button>
            <div className="mt-8 w-full rounded-2xl bg-panel p-5 text-sm">
              <p className="mb-2 text-xs tracking-widest text-accent">তথ্য</p>
              <p><span className="text-neutral-500">{S.info.name}:</span> {letter.name}</p>
              <p><span className="text-neutral-500">{S.info.roman}:</span> {letter.roman}</p>
              <p><span className="text-neutral-500">{S.info.strokeCount}:</span> {bn(n)}টি</p>
              {letter.hint && <p className="mt-2 text-neutral-300">{letter.hint}</p>}
            </div>
          </>
        )}
        {(step === 'traceNum' || step === 'traceNoNum' || step === 'memory') && (
          <>
            <p className="mt-5 text-neutral-400">{S.stroke} <b className="text-accent">{bn(Math.min(strokeIdx + 1, n))}</b> / {bn(n)}
              {!stepDone && guides[strokeIdx] && <span className="ml-3 text-sm text-neutral-500">{DIRECTION[guides[strokeIdx].direction]}</span>}</p>
            {step === 'traceNum' && (
              <button onClick={() => setShowNumbers((v) => !v)} className="mt-2 text-xs text-neutral-500">{showNumbers ? S.hideNumbers : S.showNumbers}</button>
            )}
          </>
        )}
      </main>

      {/* footer */}
      <footer className="fixed inset-x-0 bottom-0 border-t border-neutral-900 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-5 py-4">
          {step === 'done' ? (
            <>
              <Link to="/" className="text-neutral-400">{S.backToList}</Link>
              <Link to={`/learn/${encodeURIComponent(nextChar)}`} className="rounded-2xl bg-accent px-6 py-3 font-semibold text-bg">{S.nextLetter} →</Link>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-400">{stepDone && step !== 'watch' ? <span className="text-accent font-semibold">✓ {S.nice}</span> : foot}</p>
              {stepDone ? (
                <button data-testid="next" onClick={advance} className="rounded-2xl bg-accent px-6 py-3 font-semibold text-bg">{S.next}</button>
              ) : (step === 'traceNum' || step === 'traceNoNum' || step === 'memory') ? (
                <button onClick={() => setHintToken((t) => t + 1)} className="rounded-2xl bg-accent/15 px-5 py-3 text-sm font-semibold text-accent ring-1 ring-accent/40">{S.showStroke}</button>
              ) : null}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
