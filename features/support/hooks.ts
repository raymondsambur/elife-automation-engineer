import { Before, After, setDefaultTimeout } from "@cucumber/cucumber";
import { PlaywrightWorld } from "./world";

// Set global step timeout load (e.g., 60 seconds)
setDefaultTimeout(60 * 1000);

/**
 * Universal hooks — open and close both browser and API contexts for
 * every scenario. This avoids needing per-scenario tags while keeping
 * setup/teardown clean. The contexts are lightweight to create.
 */

Before(async function (this: PlaywrightWorld) {
  await this.openBrowser();
  await this.openApiContext();
});

After(async function (this: PlaywrightWorld) {
  await this.closeBrowser();
  await this.closeApiContext();
});
