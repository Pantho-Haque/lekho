import { Link } from 'react-router-dom';
import { listLetters, type LetterGroup } from '@pantho075/matra';
import { S, bn } from '../lib/strings';
import { doneSet } from '../lib/progress';

const GROUPS: { key: LetterGroup; title: string }[] = [
  { key: 'vowel', title: S.vowels },
  { key: 'consonant', title: S.consonants },
  { key: 'digit', title: S.digits },
];

export default function Home() {
  const done = doneSet();
  const all = listLetters();
  const doneCount = all.filter((l) => done.has(l.char)).length;
  return (
    <main className="mx-auto max-w-md px-5 py-10 pb-16">
      <h1 className="text-4xl font-bold text-accent">{S.appName}</h1>
      <p className="mt-2 text-neutral-400">{S.tagline}</p>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full bg-accent transition-all" style={{ width: `${(100 * doneCount) / all.length}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-neutral-500">{bn(doneCount)} / {bn(all.length)} {S.done}</p>

      {GROUPS.map(({ key, title }) => {
        const letters = listLetters(key);
        const n = letters.filter((l) => done.has(l.char)).length;
        return (
          <section key={key} className="mt-10">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm uppercase tracking-widest text-neutral-500">{title}</h2>
              <span className="text-xs text-neutral-600">{bn(n)} / {bn(letters.length)}</span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {letters.map((l) => {
                const isDone = done.has(l.char);
                return (
                  <Link key={l.char} to={`/learn/${encodeURIComponent(l.char)}`} aria-label={l.name}
                    className={`relative flex aspect-square items-center justify-center rounded-2xl text-4xl font-semibold shadow-md transition active:scale-95 ${isDone ? 'bg-accent/15 text-accent ring-1 ring-accent/40' : 'bg-cream text-ink'}`}>
                    {l.char}
                    {isDone && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-bg">✓</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
