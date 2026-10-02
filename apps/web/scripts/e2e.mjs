// Headless end-to-end check over CDP: walks the whole lesson for a letter by synthesising pointer input.
// usage: node scripts/e2e.mjs [char] [baseUrl]   (dev server must be running)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resample } from '../../../packages/bangla-strokes/dist/index.js';

const CHAR = process.argv[2] ?? 'অ';
const BASE = process.argv[3] ?? 'http://localhost:5177';
const OUT = '/tmp/lekho-e2e'; mkdirSync(OUT, { recursive: true });
const PORT = 9333;
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', `--remote-debugging-port=${PORT}`, '--window-size=390,844', '--user-data-dir=/tmp/lekho-chrome-profile', 'about:blank'],
  { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + JSON.stringify(r.exceptionDetails.exception?.description)); return r.result.value; };
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64')); };
const fail = (m) => { console.error('FAIL:', m); chrome.kill(); process.exit(1); };
const ok = (m) => console.log('ok  ', m);

try {
  let targets;
  for (let i = 0; i < 120 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch { await sleep(250); } }
  const page = targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  // home: no horizontal overflow
  await send('Page.navigate', { url: `${BASE}/` }); await sleep(1500);
  const overflow = await evaluate('document.documentElement.scrollWidth - window.innerWidth');
  overflow > 0 ? fail(`home overflows by ${overflow}px`) : ok('home fits 390px');
  await shot('0-home');

  await send('Page.navigate', { url: `${BASE}/learn/${encodeURIComponent(CHAR)}` }); await sleep(2500);
  const strokes = JSON.parse(await evaluate(`JSON.stringify((${(await evaluate('typeof window.__strokes')) === 'undefined' ? 'null' : 'window.__strokes'}))`)) ?? (await import('../../../packages/bangla-strokes/dist/index.js')).getStrokes(CHAR);
  await shot('1-watch');
  const text = () => evaluate('document.body.innerText');
  if (!(await text()).includes('কীভাবে লেখা হয়')) fail('watch step title missing');
  ok('watch step rendered');

  const clickTestId = async (t) => evaluate(`(()=>{const b=document.querySelector('[data-testid="${t}"]'); if(!b) return false; b.click(); return true;})()`);
  const ctm = async () => evaluate(`(()=>{const s=document.querySelector('main svg'); const m=s.getScreenCTM(); return [m.a,m.b,m.c,m.d,m.e,m.f];})()`);
  const toScreen = (m, [x, y]) => ({ x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] });
  const draw = async (pts) => {
    const m = await ctm();
    const P = resample(pts, 24).map((p) => toScreen(m, p));
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', buttons: 1, clickCount: 1, ...P[0] });
    for (const p of P.slice(1)) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', button: 'left', buttons: 1, ...p }); await sleep(8); }
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', buttons: 0, clickCount: 1, ...P[P.length - 1] });
    await sleep(150);
  };
  const counter = async () => (await text()).match(/স্ট্রোক ([০-৯]+) \/ ([০-৯]+)/)?.[1];

  if (!(await clickTestId('next'))) fail('next button missing on watch step');
  await sleep(400);
  for (const stepName of ['trace-numbers', 'trace-plain']) {
    if (!(await text()).includes('ট্রেস করো')) fail(`${stepName}: title missing`);
    // wrong stroke (reversed) must not advance
    const before = await counter();
    await draw([...strokes[0]].reverse());
    if ((await counter()) !== before) fail(`${stepName}: reversed stroke was accepted`);
    ok(`${stepName}: reversed stroke rejected`);
    for (let i = 0; i < strokes.length; i++) {
      await draw(strokes[i]);
      if (i === 1) await shot(`2-${stepName}-mid`);
      const c = await counter();
      const expected = String(Math.min(i + 2, strokes.length)).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
      if (c !== expected) fail(`${stepName}: after stroke ${i + 1} counter is ${c}, expected ${expected}`);
    }
    if (!(await text()).includes('দারুণ')) fail(`${stepName}: completion toast missing`);
    ok(`${stepName}: all ${strokes.length} strokes accepted`);
    await shot(`3-${stepName}-done`);
    if (!(await clickTestId('next'))) fail(`${stepName}: next missing`);
    await sleep(400);
  }

  // parts (skipped by the app for single-part letters)
  const hasParts = (await text()).includes('অংশ দিয়ে গড়ো');
  const parts = hasParts ? await evaluate(`[...document.querySelectorAll('[data-part]')].map(b=>+b.dataset.part)`) : [];
  if (!hasParts && !(await text()).includes('মনে করে লেখো')) fail('neither parts nor memory step after tracing');
  if (!hasParts) ok('parts: skipped (single-part letter)');
  const clickPart = (p) => evaluate(`(()=>{const b=document.querySelector('[data-part="${p}"]'); if(!b) return false; b.click(); return true;})()`);
  if (parts.length > 1) {
    for (const p of [...parts].sort((a, b) => b - a)) { await clickPart(p); await sleep(100); } // wrong (reverse) order
    await clickTestId('check'); await sleep(200);
    if (!(await text()).includes('ক্রম ঠিক হয়নি')) fail('parts: wrong order not reported');
    ok('parts: wrong order reported');
    await shot('4-parts-wrong');
    await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('রিসেট')).click()`); await sleep(200);
  }
  if (hasParts) {
    for (const p of [...parts].sort((a, b) => a - b)) { await clickPart(p); await sleep(100); }
    await clickTestId('check'); await sleep(300);
    if (!(await clickTestId('next'))) fail('parts: correct order did not unlock next');
    ok('parts: correct order accepted');
    await sleep(400);
  }

  // memory
  if (!(await text()).includes('মনে করে লেখো')) fail('memory title missing');
  await shot('5-memory');
  for (const s of strokes) await draw(s);
  if (!(await text()).includes('দারুণ')) fail('memory: not completed');
  ok('memory: completed');
  await clickTestId('next'); await sleep(500);
  if (!(await text()).includes('সম্পন্ন')) fail('done screen missing');
  const saved = await evaluate(`localStorage.getItem('lekho.done')`);
  if (!saved?.normalize('NFC').includes(CHAR.normalize('NFC'))) fail('progress not saved');
  ok('done screen + progress saved');
  await shot('6-done');
  await send('Page.navigate', { url: `${BASE}/` }); await sleep(1200);
  const marked = await evaluate(`[...document.querySelectorAll('a[href^="/learn/"]')].some(a => a.textContent.includes('✓') && decodeURIComponent(a.getAttribute('href').slice(7)).normalize('NFC') === ${JSON.stringify(CHAR)}.normalize('NFC'))`);
  if (!marked) fail('home does not show ✓ for the finished letter');
  ok('home shows ✓');
  await shot('7-home-after');
  console.log('ALL PASSED for', CHAR, '— screenshots in', OUT);
} catch (e) { fail(e.stack ?? e); }
chrome.kill(); process.exit(0);
