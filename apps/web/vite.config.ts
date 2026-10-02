import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command }) => {
  // dev: point at the package source so data edits hot-reload; build uses the published dist
  const alias: Record<string, string> = command === 'serve'
    ? { 'bangla-strokes': fileURLToPath(new URL('../../packages/bangla-strokes/src/index.ts', import.meta.url)) }
    : {};
  return { plugins: [react(), tailwindcss()], resolve: { alias } };
});
