import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. React Core
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'vendor-react';
              }
              // 2. Framer Motion Animation Engine
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              // 3. Lucide Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // 4. Data & Network Stack
              if (id.includes('@tanstack') || id.includes('axios')) {
                return 'vendor-query';
              }
              // 5. Excel Exporter (Lazy)
              if (id.includes('xlsx')) {
                return 'vendor-excel';
              }
              // 6. QR & Confetti Effects
              if (id.includes('qrcode.react') || id.includes('canvas-confetti')) {
                return 'vendor-effects';
              }
            }
          },
        },
      },
    },
  };
});
