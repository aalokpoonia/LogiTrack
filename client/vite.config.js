import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite Configuration
 *
 * WHY DEV PROXY?
 * In development, we proxy /api requests from the Vite dev server (port 5173)
 * to our Express backend (port 5000). This means:
 * - Browser thinks both frontend and API are on the SAME origin (localhost:5173)
 * - CORS is completely bypassed in development — no more CORS errors
 * - No need to configure CORS for localhost at all
 *
 * In production, Netlify handles hosting while the backend API uses the configured
 * VITE_API_URL environment variable instead of the dev proxy.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
