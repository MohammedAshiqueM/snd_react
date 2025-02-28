import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from any IP
    port: 5173,
  },
  base: './', // Use './' for local development, adjust for production if needed
  build: {
    outDir: 'dist', // Output directory
    assetsDir: 'assets', // Optional: Directory for static assets
    emptyOutDir: true, // Clean the output directory before building
    sourcemap: true, // Generate source maps for debugging
  },
  define: {
    'process.env': process.env, // Pass environment variables to the app
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle these dependencies
  },
});