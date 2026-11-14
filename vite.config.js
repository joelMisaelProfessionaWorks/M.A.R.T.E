import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets work on GitHub Pages (/M.A.R.T.E/), subfolders, and locally
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
