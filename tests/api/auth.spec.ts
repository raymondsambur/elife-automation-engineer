import { test, expect } from "@playwright/test";
import { ApiCredentials } from "../../src/data";

/**
 * Authentication Tests — Restful-Booker API
 *
 * Tests the /auth endpoint which issues tokens for
 * protected operations (PUT, PATCH, DELETE).
 */
test.describe("Auth - CreateToken", () => {
  test("should return a token with valid credentials", async ({
    request,
  }) => {
    const response = await request.post("/auth", {
      data: ApiCredentials.valid,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  });

  test("should reject invalid credentials", async ({ request }) => {
    const response = await request.post("/auth", {
      data: ApiCredentials.invalid,
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    /**
     * BUG / UNEXPECTED BEHAVIOR:
     * The API returns HTTP 200 even for bad credentials. Instead of
     * returning 401 Unauthorized, it responds with:
     *   { "reason": "Bad credentials" }
     *
     * This violates RESTful conventions — a failed authentication
     * attempt should return 401, not 200.
     */
    expect(body).toHaveProperty("reason", "Bad credentials");
  });

  test("should handle missing body gracefully", async ({ request }) => {
    const response = await request.post("/auth", {
      data: {},
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    /**
     * BUG / UNEXPECTED BEHAVIOR:
     * Sending an empty body still returns 200 with { "reason": "Bad credentials" }.
     * A proper API should return 400 Bad Request with a validation error
     * indicating that username and password fields are required.
     */
    expect(body).toHaveProperty("reason", "Bad credentials");
  });
});
