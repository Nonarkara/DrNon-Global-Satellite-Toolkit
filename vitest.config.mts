import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests tagged "live" hit real public APIs; they are opt-in so the default
    // suite stays fast and works offline.
    testTimeout: 30_000,
  },
  resolve: {
    alias: { "@": new URL("./src/", import.meta.url).pathname },
  },
});
