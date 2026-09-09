import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    isolate: false, // Allow dynamic imports to work properly
    testTimeout: 30000, // 30 seconds for slow CLI tests
    // Two runners share this package: the files below are written against
    // bun:test and run with `bun test`; everything else runs here.
    include: ['tests/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      'tests/unit/extractors/**',
      'tests/unit/utils/**',
      'tests/integration/**',
    ],
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