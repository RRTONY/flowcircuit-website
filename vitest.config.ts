import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": templateRoot,
      "@shared": path.resolve(templateRoot, "shared"),
      // "server-only" guards against client-bundle imports via a Next.js/webpack
      // specific condition that Vite's plain Node test runner doesn't set, so it
      // throws unconditionally under vitest. Stub it out for tests only.
      "server-only": path.resolve(templateRoot, "server/_core/test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
  },
});
