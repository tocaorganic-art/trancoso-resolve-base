import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    base44(),
    react(),
  ],
  optimizeDeps: {
    // Evita reotimização sob demanda (504) ao abrir páginas que usam locales do date-fns
    include: ['date-fns', 'date-fns/locale'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
});