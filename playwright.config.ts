import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration
 *
 * Organized into two test projects:
 * 1. UI Tests  — Browser-based tests against SauceDemo (saucedemo.com)
 * 2. API Tests — HTTP-level tests against Restful-Booker API
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once on CI for resilience against flaky network calls */
  retries: process.env.CI ? 1 : 0,

  /* Limit parallel workers on CI to avoid resource contention */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],

  /* Shared settings for all projects */
  use: {
    /* Capture trace on first retry for debugging */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",
  },

  projects: [
    /* ──────────────────────────────────────────────
     * UI Tests — SauceDemo
     * Tests run in Chromium with full browser context
     * ────────────────────────────────────────────── */
    {
      name: "ui-tests",
      testDir: "./tests/ui",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.saucedemo.com",
        /* Record video only on failure for debugging */
        video: "on-first-retry",
      },
    },

    /* ──────────────────────────────────────────────
     * API Tests — Restful-Booker
     * Tests use Playwright's request context (no browser needed)
     * ────────────────────────────────────────────── */
    {
      name: "api-tests",
      testDir: "./tests/api",
      use: {
        baseURL: "https://restful-booker.herokuapp.com",
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    },
  ],
});
