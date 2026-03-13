import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PlaywrightWorld } from "../../support/world";
import { Users, Products } from "../../../src/data";

const sortOptions: Record<string, string> = {
  "Price (low to high)": "lohi",
  "Price (high to low)": "hilo",
  "Name (A to Z)": "az",
  "Name (Z to A)": "za",
};

Given("I am logged in as {string}", async function (this: PlaywrightWorld, user: string) {
  await this.ui.loginPage.goto();
  if (user === "standard_user") {
    await this.ui.loginPage.login(Users.standard.username, Users.standard.password);
  } else if (user === "problem_user") {
    await this.ui.loginPage.login(Users.problem.username, Users.problem.password);
  }
  await this.ui.inventoryPage.expectLoaded();
});

When("I add {string} to the cart", async function (this: PlaywrightWorld, product: string) {
  await this.ui.inventoryPage.addProductToCart(product);
});

When("I remove {string} from the cart", async function (this: PlaywrightWorld, product: string) {
  await this.ui.inventoryPage.removeProductFromCart(product);
});

Then("the cart badge should show {int}", async function (this: PlaywrightWorld, count: number) {
  await this.ui.inventoryPage.expectCartBadge(count);
});

Then("the cart badge should not be visible", async function (this: PlaywrightWorld) {
  await this.ui.inventoryPage.expectCartEmpty();
});

When("I go to the cart", async function (this: PlaywrightWorld) {
  await this.ui.inventoryPage.goToCart();
  await this.ui.cartPage.expectLoaded();
});

Then("the cart should contain {string}", async function (this: PlaywrightWorld, product: string) {
  const items = await this.ui.cartPage.getItemNames();
  expect(items).toContain(product);
});

Then("the cart should not contain {string}", async function (this: PlaywrightWorld, product: string) {
  const items = await this.ui.cartPage.getItemNames();
  expect(items).not.toContain(product);
});

When("I remove {string} from the cart page", async function (this: PlaywrightWorld, product: string) {
  await this.ui.cartPage.removeItem(product);
});

When("I sort products by {string}", async function (this: PlaywrightWorld, label: string) {
  const option = sortOptions[label] as "lohi" | "hilo" | "az" | "za";
  await this.ui.inventoryPage.sortBy(option);
});

Then("products should be sorted by price ascending", async function (this: PlaywrightWorld) {
  const prices = await this.ui.inventoryPage.getProductPrices();
  for (let i = 1; i < prices.length; i++) {
    expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
  }
});

Then("products should be sorted by price descending", async function (this: PlaywrightWorld) {
  const prices = await this.ui.inventoryPage.getProductPrices();
  for (let i = 1; i < prices.length; i++) {
    expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
  }
});

Then("products should be sorted by name ascending", async function (this: PlaywrightWorld) {
  const names = await this.ui.inventoryPage.getProductNames();
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  expect(names).toEqual(sorted);
});

Then("products should be sorted by name descending", async function (this: PlaywrightWorld) {
  const names = await this.ui.inventoryPage.getProductNames();
  const sorted = [...names].sort((a, b) => b.localeCompare(a));
  expect(names).toEqual(sorted);
});

Given("I proceed to checkout", async function (this: PlaywrightWorld) {
  await this.ui.inventoryPage.goToCart();
  await this.ui.cartPage.checkout();
});

When(
  "I fill in checkout with first name {string} last name {string} postal code {string}",
  async function (this: PlaywrightWorld, firstName: string, lastName: string, postalCode: string) {
    await this.ui.checkoutPage.fillInformation(firstName, lastName, postalCode);
  }
);

When("I continue checkout", async function (this: PlaywrightWorld) {
  await this.ui.checkoutPage.continue();
});

Then(
  "I should see the checkout error {string}",
  async function (this: PlaywrightWorld, message: string) {
    await this.ui.checkoutPage.expectError(message);
  }
);

Then("the total should equal subtotal plus tax", async function (this: PlaywrightWorld) {
  const subtotal = await this.ui.checkoutPage.getSubtotal();
  const tax = await this.ui.checkoutPage.getTax();
  const total = await this.ui.checkoutPage.getTotal();
  expect(total).toBeCloseTo(subtotal + tax, 2);
});

When("I finish the purchase", async function (this: PlaywrightWorld) {
  await this.ui.checkoutPage.finish();
});

Then("I should see the order confirmation", async function (this: PlaywrightWorld) {
  await this.ui.checkoutPage.expectOrderComplete();
});
