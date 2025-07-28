import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    isolate: false, // Allow dynamic imports to work properly
    testTimeout: 30000, // 30 seconds for slow CLI tests
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  esbuild: {
    target: 'node18',
  },
})