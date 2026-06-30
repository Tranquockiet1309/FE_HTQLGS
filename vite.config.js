import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api và /hub sang ASP.NET backend khi chạy local
      '/api': {
        target: 'http://localhost:5065',
        changeOrigin: true,
      },
      '/hub': {
        target: 'http://localhost:5065',
        changeOrigin: true,
        ws: true, // Hỗ trợ WebSocket cho SignalR
      },
      // Proxy static files (ảnh giao hàng, upload)
      '/uploads': {
        target: 'http://localhost:5065',
        changeOrigin: true,
      },
    },
  },
})

