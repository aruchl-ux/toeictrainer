import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const shared = { '@shared': resolve('src/shared') }

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()], resolve: { alias: shared } },
  preload: { plugins: [externalizeDepsPlugin()], resolve: { alias: shared } },
  renderer: {
    resolve: { alias: { ...shared, '@renderer': resolve('src/renderer/src') } },
    plugins: [react()],
    // Two frontends over one main process: the poster trainer and the agent-style Office view.
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          office: resolve('src/renderer/office.html')
        }
      }
    }
  }
})
