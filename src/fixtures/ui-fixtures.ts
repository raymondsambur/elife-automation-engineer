import { test as base } from "@playwright/test";
import {
  LoginPage,
  InventoryPage,
  CartPage,
  CheckoutPage,
} from "../pages";

/**
 * Custom Playwright fixtures that inject Page Object instances
 * into every UI test. This eliminates boilerplate construction
 * and ensures consistency across the test suite.
 */
type SauceDemoFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<SauceDemoFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from "@playwright/test";
