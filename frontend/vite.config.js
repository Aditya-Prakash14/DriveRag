import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/drive': 'http://localhost:8000',
      '/sync-drive': 'http://localhost:8000',
      '/ask': 'http://localhost:8000',
      '/documents': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
    },
  },
})
