import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    allowedHosts: ['.loca.lt', 'localhost']
  },
  preview: {
    port: 443, // Puerto para preview (npm run preview)
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'sweetalert2',
            'lucide-react'
          ]
        }
      }
    }
  }
})
