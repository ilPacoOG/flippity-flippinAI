import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend server
        changeOrigin: true, // Ensure the origin of the request matches the target
        secure: false, // Ignore SSL verification if necessary
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: strip '/api' if your server routes do not include it
      },
    },
  },
});
