import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // * Prefix '' → đọc cả biến không có VITE_ (chỉ dùng trong config, không lộ ra code client).
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET?.trim() || 'http://localhost:8000'
  const port = Number(env.FRONTEND_PORT?.trim()) || 5173

  return {
    plugins: [react()],
    server: {
      port,
      // * FE gọi fetch('/api/...') → Vite chuyển sang backend: cùng origin nên cookie
      //   httpOnly (accessToken, refreshToken) gửi/nhận bình thường, không cần CORS.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
