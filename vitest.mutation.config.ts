import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Config used only by Stryker (TESTING.md section 8.2). It limits the initial
 * and per-mutant runs to the pure logic and the stores, which is what Stryker
 * mutates, so the dry run stays fast.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    include: ["src/lib/**/*.test.{ts,tsx}", "src/store/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "tests/**"],
  },
});
