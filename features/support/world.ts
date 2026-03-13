import { chromium, Browser, BrowserContext, Page, APIRequestContext, request as pwRequest } from "@playwright/test";
import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import { LoginPage, InventoryPage, CartPage, CheckoutPage } from "../../src/pages";

/**
 * Custom Cucumber World that holds Playwright browser, page, and API request
 * context. UI step definitions access page objects via this.ui.*; API steps
 * access the HTTP client via this.api.
 */
export class PlaywrightWorld extends World {
  // ── Browser / UI ──────────────────────────────────────────────
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page Objects
  ui!: {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
  };

  // ── API ───────────────────────────────────────────────────────
  apiRequest!: APIRequestContext;

  /** Scratch space for values shared between steps */
  store: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async openBrowser(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({
      baseURL: "https://www.saucedemo.com",
    });
    this.page = await this.context.newPage();
    this.ui = {
      loginPage: new LoginPage(this.page),
      inventoryPage: new InventoryPage(this.page),
      cartPage: new CartPage(this.page),
      checkoutPage: new CheckoutPage(this.page),
    };
  }

  async closeBrowser(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }

  async openApiContext(): Promise<void> {
    this.apiRequest = await pwRequest.newContext({
      baseURL: "https://restful-booker.herokuapp.com",
      extraHTTPHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async closeApiContext(): Promise<void> {
    await this.apiRequest?.dispose();
  }
}

setWorldConstructor(PlaywrightWorld);
