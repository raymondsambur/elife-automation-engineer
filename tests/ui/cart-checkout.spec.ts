import { test, expect } from "../../src/fixtures/ui-fixtures";
import { Users, Products, CheckoutInfo } from "../../src/data";

/**
 * End-to-End Shopping Cart & Checkout Tests — SauceDemo
 *
 * WHY I CHOSE THIS TEST SUITE:
 * ─────────────────────────────
 * The shopping cart and checkout flow is the revenue-critical path of any
 * e-commerce application. While login is the entry gate, the cart-to-checkout
 * pipeline is where business value is actually realized. Bugs here directly
 * translate to lost revenue and broken customer trust.
 *
 * This suite covers:
 * 1. Cart operations (add/remove items, badge updates, persistence)
 * 2. Product sorting verification (business logic correctness)
 * 3. Checkout form validation (preventing bad data)
 * 4. Full end-to-end purchase flow (the golden path)
 * 5. Price calculation verification (financial accuracy)
 *
 * These tests exercise multiple pages and state transitions, catching
 * integration bugs that unit tests would miss.
 */

test.describe("Shopping Cart", () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test("should add a single item to cart and update badge", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.expectCartBadge(1);
  });

  test("should add multiple items and reflect correct badge count", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.addProductToCart(Products.bikeLight);
    await inventoryPage.addProductToCart(Products.onesie);
    await inventoryPage.expectCartBadge(3);
  });

  test("should remove item from cart and update badge", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.addProductToCart(Products.bikeLight);
    await inventoryPage.expectCartBadge(2);

    await inventoryPage.removeProductFromCart(Products.backpack);
    await inventoryPage.expectCartBadge(1);
  });

  test("should show empty cart when all items are removed", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.expectCartBadge(1);

    await inventoryPage.removeProductFromCart(Products.backpack);
    await inventoryPage.expectCartEmpty();
  });

  test("should persist cart items when navigating to cart page", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.addProductToCart(Products.bikeLight);
    await inventoryPage.goToCart();

    await cartPage.expectLoaded();
    const items = await cartPage.getItemNames();
    expect(items).toContain(Products.backpack);
    expect(items).toContain(Products.bikeLight);
  });

  test("should remove items from the cart page", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.addProductToCart(Products.bikeLight);
    await inventoryPage.goToCart();

    await cartPage.removeItem(Products.backpack);
    const items = await cartPage.getItemNames();
    expect(items).not.toContain(Products.backpack);
    expect(items).toContain(Products.bikeLight);
  });
});

test.describe("Product Sorting", () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test("should sort products by price low to high", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy("lohi");
    const prices = await inventoryPage.getProductPrices();

    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test("should sort products by price high to low", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy("hilo");
    const prices = await inventoryPage.getProductPrices();

    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test("should sort products by name A to Z", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy("az");
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test("should sort products by name Z to A", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy("za");
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });
});

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage }) => {
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await inventoryPage.addProductToCart(Products.backpack);
    await inventoryPage.goToCart();
    await cartPage.checkout();
  });

  test("should require first name on checkout", async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation("", "Doe", "90210");
    await checkoutPage.continue();
    await checkoutPage.expectError("First Name is required");
  });

  test("should require last name on checkout", async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation("Jane", "", "90210");
    await checkoutPage.continue();
    await checkoutPage.expectError("Last Name is required");
  });

  test("should require postal code on checkout", async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation("Jane", "Doe", "");
    await checkoutPage.continue();
    await checkoutPage.expectError("Postal Code is required");
  });

  test("should complete a full end-to-end purchase", async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation(
      CheckoutInfo.valid.firstName,
      CheckoutInfo.valid.lastName,
      CheckoutInfo.valid.postalCode
    );
    await checkoutPage.continue();

    // Verify the overview page shows correct pricing
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(subtotal).toBeGreaterThan(0);
    expect(tax).toBeGreaterThan(0);
    // Verify total = subtotal + tax (accounting for floating point)
    expect(total).toBeCloseTo(subtotal + tax, 2);

    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });
});
