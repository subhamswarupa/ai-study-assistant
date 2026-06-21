import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor';
          if (id.includes('node_modules/framer-motion')) return 'anim';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/jspdf')) return 'pdf';
          if (id.includes('node_modules/html2canvas')) return 'canvas';
        },
      },
    },
  },
})
