import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["data/**/*.test.ts", "site/**/*.test.ts", "worker/**/*.test.ts"],
  },
});
