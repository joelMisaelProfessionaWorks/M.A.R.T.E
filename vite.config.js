import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Garantiza que los assets funcionen en GitHub Pages (/M.A.R.T.E/), subcarpetas y localmente
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
