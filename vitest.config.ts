import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}", "tests/contract/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "tests/e2e/**", "playwright-report/**", "test-results/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/data/**",
        "src/**/index.ts",
        "src/dev/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
