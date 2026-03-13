import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the SauceDemo Login Page.
 *
 * Encapsulates all interactions with the login form,
 * keeping test files focused on behavior rather than selectors.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator(".error-button");
  }

  /** Navigate to the login page */
  async goto() {
    await this.page.goto("/");
  }

  /** Fill credentials and submit the login form */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Assert that a specific error message is displayed */
  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  /** Assert that the error message container is hidden */
  async expectNoError() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  /** Dismiss the error message by clicking the X button */
  async dismissError() {
    await this.errorButton.click();
  }
}
