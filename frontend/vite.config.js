import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto para desarrollo (npm run dev)
    host: true
  },
  preview: {
    port: 442, // Puerto para preview (npm run preview)
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'sweetalert1',
            'lucide-react'
          ]
        }
      }
    }
  }
})
