import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the SauceDemo Checkout Flow.
 *
 * Covers all three checkout steps:
 * 1. Your Information (form entry)
 * 2. Overview (order summary)
 * 3. Complete (confirmation)
 */
export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly summarySubtotal: Locator;
  readonly summaryTax: Locator;
  readonly summaryTotal: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.summarySubtotal = page.locator(".summary_subtotal_label");
    this.summaryTax = page.locator(".summary_tax_label");
    this.summaryTotal = page.locator(".summary_total_label");
    this.completeHeader = page.locator(".complete-header");
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /** Fill the checkout information form */
  async fillInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /** Submit the information form */
  async continue() {
    await this.continueButton.click();
  }

  /** Finish the order on the overview page */
  async finish() {
    await this.finishButton.click();
  }

  /** Assert the checkout error message */
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  /** Parse a dollar amount from a summary label */
  private parseDollar(text: string): number {
    const match = text.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /** Get the subtotal from the overview page */
  async getSubtotal(): Promise<number> {
    const text = await this.summarySubtotal.textContent();
    return this.parseDollar(text || "");
  }

  /** Get the tax from the overview page */
  async getTax(): Promise<number> {
    const text = await this.summaryTax.textContent();
    return this.parseDollar(text || "");
  }

  /** Get the total from the overview page */
  async getTotal(): Promise<number> {
    const text = await this.summaryTotal.textContent();
    return this.parseDollar(text || "");
  }

  /** Assert the order completion message */
  async expectOrderComplete() {
    await expect(this.completeHeader).toHaveText(
      "Thank you for your order!"
    );
  }

  /** Navigate back to the products page */
  async backHome() {
    await this.backHomeButton.click();
  }
}
