import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Fångar upp alla anrop som börjar med /api
      '/api': {
        target: 'https://adorable-trust-long-term-memory-api.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})