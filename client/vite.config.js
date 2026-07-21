import { defineConfig } from 'vite'
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
 * In production, Nginx or Netlify handles this routing — proxy is dev-only.
 *
 * INTERVIEW QUESTION: "How do you handle CORS in a MERN dev environment?"
 * Answer: Vite proxy — avoids needing CORS config in development entirely.
 * In production, you configure CORS properly for your actual domain.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
