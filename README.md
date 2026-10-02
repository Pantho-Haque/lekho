# lekho (লেখো)

Learn to write Bengali letters stroke by stroke. Modelled on kanji-tracing apps: watch → trace with
numbers → trace without → build from parts → write from memory.

- `packages/matra` — publishable npm package: stroke data + heuristic scoring/recognition. Zero deps, no DOM.
- `apps/web` — Vite + React + Tailwind app (Bengali UI) that consumes the package. Progress in `localStorage`.

```bash
npm install
npm test                      # package unit tests
npm run build -w packages/matra
npm run dev                   # web app (aliases @pantho075/matra to the package source for HMR)
```

Dev-only tools in `apps/web`:

- `/editor` — author strokes over the real font outline, copy a `Letter` literal.
- `node scripts/glyphs.mjs` — regenerate `src/dev/glyphs.json` + gridded previews in `/tmp/lekho-preview` (needs `dev/NotoSansBengali-Regular.ttf`, see script).
- `node scripts/skeleton.mjs "কখগ" consonant` — draft stroke data from font outlines (see ARCHITECTURE.md §5.6).
- `node scripts/e2e.mjs অ` — headless end-to-end walk through a whole lesson via CDP (dev server on :5177).

Publish the package: `npm publish -w packages/matra --access public`.
