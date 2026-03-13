import { Before, After } from "@cucumber/cucumber";
import { PlaywrightWorld } from "./world";

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
