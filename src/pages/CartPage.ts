import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the SauceDemo Cart Page.
 */
export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.cartItems = page.locator(".cart_item");
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]'
    );
  }

  /** Assert that the cart page is loaded */
  async expectLoaded() {
    await expect(this.title).toHaveText("Your Cart");
  }

  /** Get all item names in the cart */
  async getItemNames(): Promise<string[]> {
    return this.page
      .locator(".inventory_item_name")
      .allTextContents();
  }

  /** Remove an item from the cart by its name */
  async removeItem(name: string) {
    const item = this.cartItems.filter({ hasText: name });
    await item.locator("button", { hasText: "Remove" }).click();
  }

  /** Proceed to checkout */
  async checkout() {
    await this.checkoutButton.click();
  }

  /** Return to shopping */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
