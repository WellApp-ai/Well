import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts"],
      exclude: [
        "packages/*/src/**/index.ts",
        "packages/*/src/**/*.d.ts",
        "packages/core/src/llm/prompts.ts",
      ],
    },
  },
});
