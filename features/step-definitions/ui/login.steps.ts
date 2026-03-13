import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../../support/world";

Given("I am on the SauceDemo login page", async function (this: PlaywrightWorld) {
  await this.ui.loginPage.goto();
});

When(
  "I log in as {string} with password {string}",
  async function (this: PlaywrightWorld, username: string, password: string) {
    await this.ui.loginPage.login(username, password);
  }
);

When(
  "I log in with username {string} and password {string}",
  async function (this: PlaywrightWorld, username: string, password: string) {
    await this.ui.loginPage.login(username, password);
  }
);

Then("I should be on the inventory page", async function (this: PlaywrightWorld) {
  await this.ui.inventoryPage.expectLoaded();
});

Then(
  "I should see the error {string}",
  async function (this: PlaywrightWorld, message: string) {
    await this.ui.loginPage.expectError(message);
  }
);

When("I dismiss the error message", async function (this: PlaywrightWorld) {
  await this.ui.loginPage.dismissError();
});

Then("I should not see an error message", async function (this: PlaywrightWorld) {
  await this.ui.loginPage.expectNoError();
});
