import { defineConfig, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";

const baseURL = process.env.PREVIEW_URL || "http://127.0.0.1:5000";
const chromiumPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || execFileSync("which", ["chromium"]).toString().trim();

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    launchOptions: {
      executablePath: chromiumPath,
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
});