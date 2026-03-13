import { test, expect } from "../../src/fixtures/ui-fixtures";
import { Users } from "../../src/data";

/**
 * Login Flow Tests — SauceDemo
 *
 * This suite validates the authentication gate of the application.
 * Login is the critical entry point — if it fails, nothing else works.
 * We test the happy path, locked-out users, validation, and error UX.
 */
test.describe("Login Flow", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should login successfully with valid credentials", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(Users.standard.username, Users.standard.password);
    await inventoryPage.expectLoaded();
  });

  test("should show error for locked out user", async ({ loginPage }) => {
    await loginPage.login(
      Users.lockedOut.username,
      Users.lockedOut.password
    );
    await loginPage.expectError(
      "Sorry, this user has been locked out"
    );
  });

  test("should show error when username is empty", async ({ loginPage }) => {
    await loginPage.login("", Users.standard.password);
    await loginPage.expectError("Username is required");
  });

  test("should show error when password is empty", async ({ loginPage }) => {
    await loginPage.login(Users.standard.username, "");
    await loginPage.expectError("Password is required");
  });

  test("should show error for invalid credentials", async ({
    loginPage,
  }) => {
    await loginPage.login("invalid_user", "wrong_password");
    await loginPage.expectError(
      "Username and password do not match any user in this service"
    );
  });

  test("should be able to dismiss error message", async ({ loginPage }) => {
    await loginPage.login("", "");
    await loginPage.expectError("Username is required");
    await loginPage.dismissError();
    await loginPage.expectNoError();
  });
});
