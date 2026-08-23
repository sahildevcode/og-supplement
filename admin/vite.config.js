import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Automatically detect Netlify, GitHub Pages, or Custom Domain
const getBasePath = () => {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  if (process.env.NETLIFY) return '/';
  if (process.env.GITHUB_ACTIONS) return '/og-admin/';
  return './';
};

// https://vite.dev/config/
export default defineConfig({
  base: getBasePath(),
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
