import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the SauceDemo Inventory (Products) Page.
 *
 * Covers product listing, sorting, cart badge, and navigation
 * to product detail and cart pages.
 */
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly burgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.inventoryItems = page.locator(".inventory_item");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator(".shopping_cart_link");
    this.burgerMenu = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.locator("#logout_sidebar_link");
  }

  /** Assert that the user has landed on the inventory page */
  async expectLoaded() {
    await expect(this.title).toHaveText("Products");
    await expect(this.page).toHaveURL(/inventory/);
  }

  /** Get the count of displayed products */
  async getProductCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  /** Sort products by the given option value */
  async sortBy(
    option: "az" | "za" | "lohi" | "hilo"
  ) {
    await this.sortDropdown.selectOption(option);
  }

  /** Get all product names in their current display order */
  async getProductNames(): Promise<string[]> {
    return this.page
      .locator(".inventory_item_name")
      .allTextContents();
  }

  /** Get all product prices in their current display order */
  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.page
      .locator(".inventory_item_price")
      .allTextContents();
    return priceTexts.map((text) => parseFloat(text.replace("$", "")));
  }

  /** Add a product to the cart by its name */
  async addProductToCart(productName: string) {
    const item = this.inventoryItems.filter({
      hasText: productName,
    });
    await item.locator("button", { hasText: "Add to cart" }).click();
  }

  /** Remove a product from the cart by its name */
  async removeProductFromCart(productName: string) {
    const item = this.inventoryItems.filter({
      hasText: productName,
    });
    await item.locator("button", { hasText: "Remove" }).click();
  }

  /** Assert the cart badge shows the expected count */
  async expectCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  /** Assert the cart badge is not visible (cart is empty) */
  async expectCartEmpty() {
    await expect(this.cartBadge).not.toBeVisible();
  }

  /** Navigate to the cart page */
  async goToCart() {
    await this.cartLink.click();
  }

  /** Open sidebar and logout */
  async logout() {
    await this.burgerMenu.click();
    await this.logoutLink.click();
  }
}
