import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Moves dist/src/sidepanel/index.html → dist/sidepanel/index.html after build.
// Vite preserves the source tree path for HTML entries; this corrects it so the
// path matches what manifest.json declares as side_panel.default_path.
function fixSidepanelOutputPath() {
  return {
    name: 'fix-sidepanel-output-path',
    closeBundle() {
      const src = path.resolve('dist/src/sidepanel/index.html');
      const dest = path.resolve('dist/sidepanel/index.html');
      if (fs.existsSync(src)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        fs.rmSync(path.resolve('dist/src'), { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), fixSidepanelOutputPath()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      input: {
        'sidepanel/index': resolve(__dirname, 'src/sidepanel/index.html'),
        'background/index': resolve(__dirname, 'src/background/index.ts'),
        'content/index': resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'shared/[name].js',
        assetFileNames: 'assets/[name][extname]',
        format: 'es',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  publicDir: 'public',
});
