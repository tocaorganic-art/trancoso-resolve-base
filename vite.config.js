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
    // Dica: Se usar date-fns v3+ e notar avisos no terminal, especifique o locale (ex: 'date-fns/locale/pt-BR')
    include: ['date-fns', 'date-fns/locale'],
  },
  build: {
    // 'es2022' oferece melhor compatibilidade com navegadores do que 'esnext'
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'vendor-date': ['date-fns'],
        },
      },
    },
  },
});