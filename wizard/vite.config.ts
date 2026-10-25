import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  esbuild: { jsx: 'automatic' },
  // Keep bundled fonts on the same origin instead of data URLs rejected by the wizard CSP.
  build: { outDir: '../dist/wizard', emptyOutDir: true, assetsInlineLimit: 0 },
});
