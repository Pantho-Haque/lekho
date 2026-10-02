const KEY = 'lekho.done';
export const doneSet = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]); } catch { return new Set(); }
};
export const markDone = (ch: string) => {
  const s = doneSet(); s.add(ch);
  localStorage.setItem(KEY, JSON.stringify([...s]));
};
export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('bn'));
  if (v) u.voice = v;
  u.lang = 'bn-BD';
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};
