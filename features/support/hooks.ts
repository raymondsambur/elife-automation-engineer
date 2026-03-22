import { Before, After, AfterAll, setDefaultTimeout, ITestCaseHookParameter } from "@cucumber/cucumber";
import { PlaywrightWorld } from "./world";
import { updateAllTestResults, TestResultEntry } from "../../notionUtil";

// Set global step timeout load (e.g., 60 seconds)
setDefaultTimeout(60 * 1000);

/**
 * Collect test results during the run, then flush them all to Notion
 * in a single batch after every scenario has finished.
 */
const pendingResults: TestResultEntry[] = [];

/**
 * Universal hooks — open and close both browser and API contexts for
 * every scenario. This avoids needing per-scenario tags while keeping
 * setup/teardown clean. The contexts are lightweight to create.
 */

Before(async function (this: PlaywrightWorld) {
  await this.openBrowser();
  await this.openApiContext();
});

After(async function (this: PlaywrightWorld, { result, pickle }: ITestCaseHookParameter) {
  // ── Clean up Playwright resources ──
  await this.closeBrowser();
  await this.closeApiContext();

  // ── Collect result for later Notion batch update ──
  const atcTag = pickle.tags.find((t) => t.name.match(/^@ATC-\d+$/));
  if (!atcTag) return; // No ATC tag, nothing to report

  const atcNumber = parseInt(atcTag.name.replace("@ATC-", ""), 10);
  const passed = result?.status?.toString() === "PASSED";
  const status = passed ? "Passed" : "Failed";
  const errorMessage = !passed && result?.message ? result.message : undefined;

  pendingResults.push({ atcNumber, status, errorMessage });
});

AfterAll({ timeout: 5 * 60 * 1000 }, async function () {
  // ── Flush all collected results to Notion in one batch ──
  try {
    await updateAllTestResults(pendingResults);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[Notion] Batch update failed: ${message}`);
  }
});
