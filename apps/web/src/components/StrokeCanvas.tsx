import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { strokeToPath, type Point, type Stroke, type StrokeGuide } from '@pantho075/matra';
import { bn } from '../lib/strings';

export type CanvasMode = 'watch' | 'trace' | 'free';

interface Props {
  /** Render-ready strokes from the package (`getLesson(char).strokes` or `guidesFromPoints`). */
  strokes: StrokeGuide[];
  mode: CanvasMode;
  /** Index of the stroke the learner should draw now (trace/free). */
  activeStroke?: number;
  /** How many strokes are already done (drawn dark). */
  completed?: number;
  /** Explicit list of stroke indices to draw dark (overrides `completed`). */
  doneStrokes?: number[];
  showNumbers?: boolean;
  /** Draw a small arrow at the active stroke's start pointing in its writing direction. */
  showArrow?: boolean;
  showGhost?: boolean;
  ghostOpacity?: number;
  /** Bump to replay the whole letter (watch mode). */
  playToken?: number;
  /** Bump to animate the active stroke once as a hint. */
  hintToken?: number;
  /** Fired with the learner's points (viewBox coords) on pen up. */
  onStroke?: (points: Stroke) => void;
  onPlayed?: () => void;
  shake?: boolean;
  error?: boolean;
  className?: string;
  /** Extra SVG drawn under the ghost (editor uses it for the font outline). */
  underlay?: React.ReactNode;
}

const W = 7; // ink width in viewBox units
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animate a path being drawn with WAAPI. Calls onDone when finished; returns a cancel fn. */
function drawPath(path: SVGPathElement, onDone: () => void): () => void {
  const L = path.getTotalLength();
  if (reduced() || L === 0) { onDone(); return () => {}; }
  path.style.strokeDasharray = `${L}`;
  const anim = path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], {
    duration: 350 + 4 * L,
    easing: 'ease-in-out',
    fill: 'forwards',
  });
  let live = true;
  anim.finished.then(() => { if (live) onDone(); }).catch(() => {});
  return () => { live = false; anim.cancel(); };
}

export default function StrokeCanvas({
  strokes, mode, activeStroke = 0, completed = 0, doneStrokes, showNumbers = false, showArrow = false, showGhost = true, ghostOpacity = 1,
  playToken = 0, hintToken = 0, onStroke, onPlayed, shake, error, className = '', underlay,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<SVGPathElement>(null);
  const hintRef = useRef<SVGPathElement>(null);

  // ── watch-mode playback ───────────────────────────────────────────────
  const [revealed, setRevealed] = useState(0);
  const [animIdx, setAnimIdx] = useState<number | null>(null);
  useEffect(() => {
    if (mode !== 'watch') return;
    setRevealed(0);
    setAnimIdx(strokes.length ? 0 : null);
  }, [mode, playToken, strokes]);
  useLayoutEffect(() => {
    if (mode !== 'watch' || animIdx === null || !animRef.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = drawPath(animRef.current, () => {
      timer = setTimeout(() => {
        setRevealed(animIdx + 1);
        if (animIdx + 1 < strokes.length) setAnimIdx(animIdx + 1);
        else { setAnimIdx(null); onPlayed?.(); }
      }, 220);
    });
    return () => { cancel(); if (timer) clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animIdx, mode]);

  // ── hint animation (trace/free) ───────────────────────────────────────
  useLayoutEffect(() => {
    if (!hintToken || !hintRef.current) return;
    const el = hintRef.current;
    el.style.opacity = '1';
    const cancel = drawPath(el, () => { el.style.opacity = '0'; });
    return () => { cancel(); el.style.opacity = '0'; };
  }, [hintToken]);

  // ── pointer input ─────────────────────────────────────────────────────
  const [ink, setInk] = useState<Stroke>([]);
  const drawing = useRef<{ pts: Stroke; inv: DOMMatrix } | null>(null);
  const toBox = (e: React.PointerEvent, inv: DOMMatrix): Point => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(inv);
    return [p.x, p.y];
  };
  const onDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (mode === 'watch' || !e.isPrimary || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const inv = ctm.inverse();
    drawing.current = { pts: [toBox(e, inv)], inv };
    setInk(drawing.current.pts.slice());
  };
  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const d = drawing.current;
    if (!d) return;
    const p = toBox(e, d.inv);
    const last = d.pts[d.pts.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.6) return;
    d.pts.push(p);
    setInk(d.pts.slice());
  };
  const onUp = () => {
    const d = drawing.current;
    if (!d) return;
    drawing.current = null;
    setInk([]);
    if (d.pts.length >= 2) onStroke?.(d.pts);
  };

  const interactive = mode !== 'watch';
  const inkStroke = { strokeWidth: W, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const dark = mode === 'watch' ? strokes.slice(0, revealed) : doneStrokes ? doneStrokes.map((i) => strokes[i]) : strokes.slice(0, completed);
  const active = strokes[activeStroke];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className={`block w-full aspect-square select-none rounded-3xl ${shake ? 'shake' : ''} ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* card */}
      <rect x="0" y="0" width="100" height="100" rx="6" className="fill-cream" />
      <rect x="0.75" y="0.75" width="98.5" height="98.5" rx="5.5" fill="none" strokeWidth="1.5"
        className={error ? 'stroke-active' : 'stroke-pink-200'} />
      <g stroke="#d9a7a7" strokeWidth="0.6" strokeDasharray="2 2" pointerEvents="none">
        <line x1="50" y1="4" x2="50" y2="96" />
        <line x1="4" y1="50" x2="96" y2="50" />
      </g>

      <g pointerEvents="none">
        {underlay}
        {/* ghost */}
        {showGhost && (
          <g className="stroke-ghost" style={{ opacity: ghostOpacity, transition: 'opacity .4s' }} {...inkStroke} strokeWidth={W + 1}>
            {strokes.map((g) => <path key={g.index} d={g.path} />)}
          </g>
        )}

        {/* completed strokes */}
        <g className="stroke-ink" {...inkStroke}>
          {dark.map((g) => <path key={g.index} d={g.path} />)}
        </g>

        {/* watch: stroke currently being drawn */}
        {mode === 'watch' && animIdx !== null && (
          <path ref={animRef} d={strokes[animIdx].path} className="stroke-ink" {...inkStroke} />
        )}

        {/* trace: highlighted active stroke */}
        {mode === 'trace' && showGhost && active && (
          <path d={active.path} className="stroke-active" {...inkStroke} />
        )}

        {/* hint overlay */}
        {interactive && active && (
          <path ref={hintRef} d={active.path} className="stroke-active" {...inkStroke} style={{ opacity: 0 }} />
        )}

        {/* direction arrow at the active stroke's start */}
        {interactive && showArrow && active && (
          <g transform={`translate(${active.start[0]} ${active.start[1]}) rotate(${active.angle})`}>
            <circle r="4.2" fill="#fff" opacity="0.9" />
            <path d="M -1.6 -2.4 L 2.2 0 L -1.6 2.4 Z" fill="#b5345a" />
          </g>
        )}

        {/* numbers */}
        {showNumbers && strokes.map((g) => (
          <text key={g.index} x={g.label[0]} y={g.label[1]} fontSize="7" fontWeight="600" textAnchor="middle" dominantBaseline="middle" fill="#b5345a">
            {bn(g.order)}
          </text>
        ))}

        {/* live ink */}
        {ink.length > 0 && <path d={strokeToPath(ink)} className="stroke-ink" {...inkStroke} opacity="0.85" />}
      </g>

      {/* pointer surface: last in DOM so it is on top */}
      {interactive && (
        <rect x="0" y="0" width="100" height="100" fill="transparent" style={{ cursor: 'crosshair' }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onLostPointerCapture={onUp} />
      )}
    </svg>
  );
}
