import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },
  optimizeDeps: {
    include: ['p5', 'astronomy-engine', 'timezone-support', 'node-geocoder']
  }
}); 