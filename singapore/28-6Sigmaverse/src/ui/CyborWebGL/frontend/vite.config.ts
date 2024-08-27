import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 5000,
  },
  preview: {
    port: 3000,
    host: true,
  },
  plugins: [
    react(),
    nodePolyfills(),
    svgr({ 
      svgrOptions: {
        
      },
    }),
    // checker({
    //   typescript: true,
    //   eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"', dev: { logLevel: ['error'] } },
    // }),
  ],

  resolve: { alias: { '@': '/src' } },
});
