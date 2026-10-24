import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all network interfaces for QR code scanning
    proxy: {
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true
      },
      '/api': {
        target: 'http://127.0.0.1:3001'
      }
    }
  }
});
