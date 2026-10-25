import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { blogPages } from './blog/plugin';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: '/',
  plugins: [tailwindcss(), blogPages(root)],
  esbuild: { jsx: 'automatic' },
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        labs: resolve(root, 'index.html'),
        ui: resolve(root, 'ui/index.html'),
        docs: resolve(root, 'ui/docs/index.html'),
        legacyDesign: resolve(root, 'design/index.html'),
        legacyDocs: resolve(root, 'design/docs/index.html'),
      },
    },
  },
});
