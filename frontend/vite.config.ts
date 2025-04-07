// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy all /api requests to your backend server
      '/api': {
        target: 'http://localhost:3001', // Change this to your backend server URL
        changeOrigin: true,
        secure: false
      }
    },
    host: true, // Listen on all addresses
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: true, // Fail if port is in use
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
});