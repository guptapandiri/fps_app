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
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyRequest) => {
            // The ePoS server rejects localhost browser origins with
            // "Invalid CORS request". This hop is server-to-server, so make
            // it equivalent to the working Postman request.
            proxyRequest.removeHeader('origin')
            proxyRequest.removeHeader('referer')
          })
        },
      },
    }
  }
})
