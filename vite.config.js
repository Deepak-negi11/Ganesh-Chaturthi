import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets load properly on GitHub Pages and custom subpaths
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
