import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
});