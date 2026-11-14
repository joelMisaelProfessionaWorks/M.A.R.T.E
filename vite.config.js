import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets work on GitHub Pages (/M.A.R.T.E/), subfolders, and locally
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
