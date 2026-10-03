import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const pkg = (name: string) => fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  // the same package aliases as tsconfig.json "paths", which vitest does not read
  resolve: {
    alias: {
      "@fraud-detector/core": pkg("core"),
      "@fraud-detector/models": pkg("models"),
      "@fraud-detector/types": pkg("types"),
    },
  },
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
