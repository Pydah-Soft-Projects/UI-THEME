import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7001,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
        secure: false
      },
      '/themes': {
        target: 'http://127.0.0.1:7000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

