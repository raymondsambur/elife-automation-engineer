import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../../support/world";
import { ApiCredentials } from "../../../src/data";

When(
  "I request a token with username {string} and password {string}",
  async function (this: PlaywrightWorld, username: string, password: string) {
    const response = await this.apiRequest.post("/auth", {
      data: { username, password },
    });
    this.store.authResponse = response;
    this.store.authBody = await response.json();
  }
);

When("I request a token with an empty body", async function (this: PlaywrightWorld) {
  const response = await this.apiRequest.post("/auth", { data: {} });
  this.store.authResponse = response;
  this.store.authBody = await response.json();
});

Then("the auth response status should be {int}", async function (this: PlaywrightWorld, status: number) {
  const response = this.store.authResponse as import("@playwright/test").APIResponse;
  expect(response.status()).toBe(status);
});

Then("the response should contain a non-empty token", async function (this: PlaywrightWorld) {
  const body = this.store.authBody as Record<string, unknown>;
  expect(body).toHaveProperty("token");
  expect(typeof body.token).toBe("string");
  expect((body.token as string).length).toBeGreaterThan(0);
});

Then(
  "the response should contain reason {string}",
  async function (this: PlaywrightWorld, reason: string) {
    const body = this.store.authBody as Record<string, unknown>;
    expect(body).toHaveProperty("reason", reason);
  }
);
