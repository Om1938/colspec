import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The NestJS API from examples/api.
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: { environment: 'jsdom' },
})
