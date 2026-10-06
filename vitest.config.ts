import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': resolve('src/shared'), '@renderer': resolve('src/renderer/src') }
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/content/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/setup.ts']
  }
})
