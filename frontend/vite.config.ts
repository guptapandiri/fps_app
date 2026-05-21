import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3500,
    proxy: {
      '/Epos_Spring': {
        target: 'https://aepos.ap.gov.in',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
