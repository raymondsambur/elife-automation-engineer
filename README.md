# E-Life Automation Engineer — Test Framework

A production-grade test automation framework built with **Playwright** and **TypeScript**, covering both UI and API testing against two target applications. BDD-style scenarios are authored with **Cucumber**.

## 🎯 Applications Under Test

| Layer | Application | URL |
|-------|------------|-----|
| **UI** | SauceDemo | [saucedemo.com](https://www.saucedemo.com) |
| **API** | Restful-Booker | [restful-booker.herokuapp.com](https://restful-booker.herokuapp.com) |

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── tests.yml                   # GitHub Actions CI pipeline (3 jobs)
├── postman-collection/
│   └── Restful-Booker.postman_collection.json  # Postman v2.1 collection
├── features/                        # Cucumber BDD layer
│   ├── api/
│   │   ├── auth.feature             # Auth scenarios
│   │   └── booking.feature          # Booking CRUD scenarios
│   ├── ui/
│   │   ├── login.feature            # Login scenarios
│   │   └── cart-checkout.feature    # Cart & checkout scenarios
│   ├── step-definitions/
│   │   ├── api/
│   │   │   ├── auth.steps.ts
│   │   │   └── booking.steps.ts
│   │   └── ui/
│   │       ├── login.steps.ts
│   │       └── cart-checkout.steps.ts
│   └── support/
│       ├── world.ts                 # Custom Cucumber World (Playwright bridge)
│       └── hooks.ts                 # Before/After lifecycle hooks
├── src/
│   ├── data/                        # Test data & factories
│   │   ├── api-data.ts              # API payloads, types, factories
│   │   └── test-data.ts             # UI credentials & constants
│   ├── fixtures/
│   │   └── ui-fixtures.ts           # Custom Playwright fixtures
│   └── pages/                       # Page Object Models
│       ├── LoginPage.ts
│       ├── InventoryPage.ts
│       ├── CartPage.ts
│       └── CheckoutPage.ts
├── tests/
│   ├── api/                         # Playwright API test specs
│   │   ├── auth.spec.ts
│   │   └── booking.spec.ts
│   └── ui/                          # Playwright UI test specs
│       ├── login.spec.ts
│       └── cart-checkout.spec.ts
├── cucumber.js                      # Cucumber runner configuration
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **npm** ≥ 9

### 1. Clone and install

```bash
git clone <repo-url>
cd elife-automation-engineer
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install --with-deps chromium
```

### 3. Run all Playwright tests

```bash
# All tests (UI + API)
npm test

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# UI tests with visible browser
npm run test:headed

# Debug with Playwright Inspector
npm run test:debug

# View the HTML report
npm run report
```

### 4. Run Cucumber BDD tests

```bash
# All BDD scenarios
npm run test:cucumber

# UI scenarios only
npm run test:cucumber:ui

# API scenarios only
npm run test:cucumber:api
```

---

## 🧪 Test Coverage

### Playwright Specs

#### UI Tests — SauceDemo (21 tests)

| Suite | Tests |
|-------|-------|
| **Login Flow** | Successful login, locked-out user, empty username, empty password, invalid credentials, error dismissal |
| **Shopping Cart** | Add single item, add multiple items, remove item, empty cart, cart persistence, remove from cart page |
| **Product Sorting** | Price low→high, price high→low, name A→Z, name Z→A |
| **Checkout** | Required first name, required last name, required postal code, full E2E purchase with price verification |

#### API Tests — Restful-Booker (14 tests)

| Suite | Tests |
|-------|-------|
| **Auth** | Valid credentials, invalid credentials (200 bug), empty body (200 bug) |
| **Create** | Full booking, booking without optional fields |
| **Read** | List all IDs, get by ID, 404 for missing ID, filter by name |
| **Update (PUT)** | Token auth, basic auth, reject without auth |
| **Partial Update (PATCH)** | Update firstname, update booking dates |
| **Delete** | Token auth, reject without auth |
| **Health Check** | Ping returns 201 (bug) |

### Cucumber BDD Feature Files

The `features/` directory mirrors the Playwright specs in human-readable Gherkin syntax. Steps reuse the same Page Objects and data factories — no logic is duplicated.

| Feature | Scenarios |
|---------|-----------|
| `ui/login.feature` | 6 |
| `ui/cart-checkout.feature` | 14 |
| `api/auth.feature` | 3 |
| `api/booking.feature` | 14 |

---

## 🏗️ Framework Design Decisions

### Why Playwright?

Playwright was chosen over Cypress for two specific reasons relevant to this task:

1. **Native API testing** — Playwright's `APIRequestContext` lets the same framework test both UI and API without a separate tool.
2. **Multi-project configuration** — `playwright.config.ts` defines separate `ui-tests` and `api-tests` projects with different base URLs, headers, and retry strategies.

### Page Object Model (POM)

Each page of SauceDemo is encapsulated in its own class (`src/pages/`). Tests read what they do, not how they interact with the DOM. When a selector changes, only one file needs updating.

### Custom Fixtures

`src/fixtures/ui-fixtures.ts` extends Playwright's test fixture system to auto-inject page objects. Tests destructure exactly what they need — `{ loginPage, inventoryPage }` — without manually constructing anything. This is idiomatic Playwright and avoids repetitive `beforeEach` setup.

### Test Data Factories

`createBookingPayload()` in `src/data/api-data.ts` generates a fresh, valid payload on every call and accepts field-level overrides. Each test is data-independent; no shared state between test runs.

### Cucumber as a BDD Layer

Cucumber sits *on top of* the existing Playwright layer — the same page objects and factories are used by both. Feature files act as living documentation for non-technical stakeholders. This design avoids duplicating test logic while making intent explicit in Gherkin.

### Two-Stage CI Pipeline

GitHub Actions runs **API tests first** as a fast smoke gate. UI tests (slower due to browser launch) only run after the API job passes. The Cucumber job runs in parallel with UI tests (both depend on the API gate), so feedback is fast without wasting CI minutes on UI browser setup when the backend is broken.

### Postman Collection

The `postman-collection/` directory contains a portable [Postman](https://www.postman.com/) v2.1 collection for manual API exploration. It uses collection variables so requests chain automatically: `Create Token` saves `{{authToken}}`; `Create Booking` saves `{{bookingId}}`; all subsequent requests consume them. Known API bugs are documented in each request's description field.

---

## 🔮 What to Prioritize Next (Next 4 Hours)

**1. Visual Regression Testing** *(highest value, ~1.5 hrs)*

SauceDemo's `problem_user` account renders broken product images and misaligned layouts that the current functional tests miss. Adding Playwright's built-in screenshot comparison (`expect(page).toHaveScreenshot()`) would catch CSS regressions and rendering bugs. This is the category of bug most likely to slip through a functional-only suite.

**2. Cross-Browser Expansion** *(~30 min)*

Adding Firefox and WebKit projects to `playwright.config.ts` costs almost no code but gives meaningful cross-browser signal. The CI pipeline already supports multiple browser installs.

**3. Auto Passed result in Notion** *(~1 hr)*

Create a script that will automatically update the Notion database with the test results.

---

## 🐛 Bug Report: Discovered During Testing

### Bug 1 — Auth endpoint returns 200 for invalid credentials

| Field | Detail |
|-------|--------|
| **Summary** | `POST /auth` returns HTTP 200 for invalid credentials instead of 401 |
| **Application** | Restful-Booker API |
| **Environment** | `https://restful-booker.herokuapp.com` |
| **Severity** | High |

**Steps to reproduce:**
1. `POST https://restful-booker.herokuapp.com/auth`
2. Body: `{ "username": "admin", "password": "wrongpassword" }`

**Expected:** `401 Unauthorized`
**Actual:** `200 OK` with body `{ "reason": "Bad credentials" }`

**Impact:** Clients relying on HTTP status codes to branch auth logic will treat a failed login as a success.

---

### Bug 2 — Auth endpoint returns 200 for empty body

| Field | Detail |
|-------|--------|
| **Summary** | `POST /auth` with no fields returns 200 instead of 400 |
| **Application** | Restful-Booker API |
| **Environment** | `https://restful-booker.herokuapp.com` |
| **Severity** | Medium |

**Steps to reproduce:**
1. `POST https://restful-booker.herokuapp.com/auth`
2. Body: `{}`

**Expected:** `400 Bad Request` with validation error
**Actual:** `200 OK` with body `{ "reason": "Bad credentials" }`

**Impact:** No distinction between "missing input" and "wrong password," making error messages useless for developers integrating the API.

---

### Bug 3 — DELETE returns 201 Created

| Field | Detail |
|-------|--------|
| **Summary** | `DELETE /booking/:id` responds with 201 Created |
| **Application** | Restful-Booker API |
| **Environment** | `https://restful-booker.herokuapp.com` |
| **Severity** | Low |

**Steps to reproduce:**
1. Create a booking via `POST /booking`, note the `bookingid`
2. Obtain a token via `POST /auth`
3. `DELETE https://restful-booker.herokuapp.com/booking/{bookingid}` with `Cookie: token=<token>`

**Expected:** `200 OK` or `204 No Content`
**Actual:** `201 Created`

**Impact:** 201 semantically means a resource was *created*. Any client checking for a success code on delete will receive a misleading signal. Standard REST clients that equate 2xx with success will still pass, but the wrong code complicates logging, monitoring, and debugging.

---

### Bug 4 — Health check endpoint returns 201 instead of 200

| Field | Detail |
|-------|--------|
| **Summary** | `GET /ping` returns 201 Created instead of 200 OK |
| **Application** | Restful-Booker API |
| **Environment** | `https://restful-booker.herokuapp.com` |
| **Severity** | Low |

**Steps to reproduce:**
1. `GET https://restful-booker.herokuapp.com/ping`

**Expected:** `200 OK`
**Actual:** `201 Created`

**Impact:** Uptime monitors and load balancers checking for `200` will report the service as down or misconfigured.

---

### Bug 5 — 404 response body is plain text, not JSON

| Field | Detail |
|-------|--------|
| **Summary** | `GET /booking/:id` for a non-existent ID returns plain text instead of a JSON error |
| **Application** | Restful-Booker API |
| **Environment** | `https://restful-booker.herokuapp.com` |
| **Severity** | Medium |

**Steps to reproduce:**
1. `GET https://restful-booker.herokuapp.com/booking/99999999`

**Expected:** `404 Not Found` with JSON body `{ "error": "Booking not found" }` and `Content-Type: application/json`
**Actual:** `404 Not Found` with plain text body `"Not Found"` and `Content-Type: text/plain`

**Impact:** Any client that calls `response.json()` on error responses will throw an unhandled exception. Clients must special-case 404 to avoid crashes.

---

## 📮 Postman Collection

The `postman-collection/` directory contains a Postman v2.1 collection for manual exploration:

- **Numbered requests** guide you through the correct order (Create Token → Create Booking → CRUD operations)
- **Auto-saved variables**: `{{authToken}}` and `{{bookingId}}` chain requests automatically
- **Inline test scripts** assert expected status codes (including known bugs, documented inline)
- **Description fields** explain each request's purpose and quirks

### Importing into Postman
1. Open Postman Desktop
2. Click **Import** → **File** → select `postman-collection/Restful-Booker.postman_collection.json`
3. Run requests top-to-bottom or use the **Collection Runner** for automated sequential execution

---

## 🔄 CI/CD

The GitHub Actions pipeline (`.github/workflows/tests.yml`) runs on:
- Every push to `main` or `develop`
- Every pull request targeting `main`
- Manual trigger via `workflow_dispatch`

### Pipeline Structure

```
api-tests ──────┬──► ui-tests
                └──► cucumber-tests
```

API tests run first as a fast smoke gate. UI and Cucumber jobs run in parallel once the API gate passes.