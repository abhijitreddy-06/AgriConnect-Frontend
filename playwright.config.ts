import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
});
