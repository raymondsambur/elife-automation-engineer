import { test, expect } from "@playwright/test";
import {
  ApiCredentials,
  createBookingPayload,
  type BookingPayload,
} from "../../src/data";

/**
 * Booking CRUD Tests — Restful-Booker API
 *
 * Full lifecycle coverage: Create → Read → Update → Partial Update → Delete
 * Each test is independent and creates its own test data.
 */

/** Helper: obtain an auth token for protected operations */
async function getAuthToken(
  request: any
): Promise<string> {
  const response = await request.post("/auth", {
    data: ApiCredentials.valid,
  });
  const body = await response.json();
  return body.token;
}

test.describe("Booking CRUD Operations", () => {
  // ──────────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────────
  test.describe("Create Booking (POST /booking)", () => {
    test("should create a new booking with all fields", async ({
      request,
    }) => {
      const payload = createBookingPayload();

      const response = await request.post("/booking", {
        data: payload,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("bookingid");
      expect(typeof body.bookingid).toBe("number");

      // Verify the returned booking data matches what we sent
      expect(body.booking.firstname).toBe(payload.firstname);
      expect(body.booking.lastname).toBe(payload.lastname);
      expect(body.booking.totalprice).toBe(payload.totalprice);
      expect(body.booking.depositpaid).toBe(payload.depositpaid);
      expect(body.booking.bookingdates.checkin).toBe(
        payload.bookingdates.checkin
      );
      expect(body.booking.bookingdates.checkout).toBe(
        payload.bookingdates.checkout
      );
      expect(body.booking.additionalneeds).toBe(payload.additionalneeds);
    });

    test("should create a booking without optional additionalneeds field", async ({
      request,
    }) => {
      const payload = createBookingPayload();
      delete payload.additionalneeds;

      const response = await request.post("/booking", {
        data: payload,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("bookingid");
      expect(body.booking.firstname).toBe(payload.firstname);
    });
  });

  // ──────────────────────────────────────────────
  // READ
  // ──────────────────────────────────────────────
  test.describe("Read Bookings", () => {
    test("should return a list of booking IDs (GET /booking)", async ({
      request,
    }) => {
      const response = await request.get("/booking");

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty("bookingid");
    });

    test("should return a specific booking by ID (GET /booking/:id)", async ({
      request,
    }) => {
      // First, create a booking so we have a known ID
      const payload = createBookingPayload({
        firstname: "ReadTest",
        lastname: "User",
      });
      const createRes = await request.post("/booking", {
        data: payload,
      });
      const { bookingid } = await createRes.json();

      // Now read it back
      const response = await request.get(`/booking/${bookingid}`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe("ReadTest");
      expect(body.lastname).toBe("User");
      expect(body.totalprice).toBe(payload.totalprice);
      expect(body.depositpaid).toBe(payload.depositpaid);
    });

    test("should return 404 for non-existent booking ID", async ({
      request,
    }) => {
      const response = await request.get("/booking/99999999");

      /**
       * BUG / UNEXPECTED BEHAVIOR:
       * The API returns "Not Found" as plain text with status 404,
       * but does NOT return a JSON error body. For an API that
       * communicates via JSON, it should return something like:
       *   { "error": "Booking not found" }
       * with a proper Content-Type: application/json header.
       */
      expect(response.status()).toBe(404);
    });

    test("should filter bookings by name", async ({ request }) => {
      // Create a booking with a unique name
      const uniqueName = `Filter${Date.now()}`;
      const payload = createBookingPayload({
        firstname: uniqueName,
        lastname: "TestFilter",
      });
      await request.post("/booking", { data: payload });

      // Filter by that name
      const response = await request.get(
        `/booking?firstname=${uniqueName}&lastname=TestFilter`
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBeTruthy();
      expect(body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ──────────────────────────────────────────────
  // UPDATE (Full)
  // ──────────────────────────────────────────────
  test.describe("Update Booking (PUT /booking/:id)", () => {
    test("should fully update a booking with token auth", async ({
      request,
    }) => {
      // Create a booking
      const original = createBookingPayload();
      const createRes = await request.post("/booking", {
        data: original,
      });
      const { bookingid } = await createRes.json();

      // Get token
      const token = await getAuthToken(request);

      // Update it
      const updated: BookingPayload = {
        firstname: "Updated",
        lastname: "Guest",
        totalprice: 275,
        depositpaid: false,
        bookingdates: {
          checkin: "2025-09-01",
          checkout: "2025-09-15",
        },
        additionalneeds: "Dinner",
      };

      const response = await request.put(`/booking/${bookingid}`, {
        data: updated,
        headers: {
          Cookie: `token=${token}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe("Updated");
      expect(body.lastname).toBe("Guest");
      expect(body.totalprice).toBe(275);
      expect(body.depositpaid).toBe(false);
      expect(body.additionalneeds).toBe("Dinner");
    });

    test("should fully update a booking with basic auth", async ({
      request,
    }) => {
      // Create a booking
      const original = createBookingPayload();
      const createRes = await request.post("/booking", {
        data: original,
      });
      const { bookingid } = await createRes.json();

      // Update using Basic Auth
      const updated: BookingPayload = {
        firstname: "BasicAuth",
        lastname: "Update",
        totalprice: 999,
        depositpaid: true,
        bookingdates: {
          checkin: "2025-12-01",
          checkout: "2025-12-20",
        },
        additionalneeds: "Parking",
      };

      const credentials = Buffer.from("admin:password123").toString(
        "base64"
      );

      const response = await request.put(`/booking/${bookingid}`, {
        data: updated,
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe("BasicAuth");
    });

    test("should reject update without authentication", async ({
      request,
    }) => {
      const original = createBookingPayload();
      const createRes = await request.post("/booking", {
        data: original,
      });
      const { bookingid } = await createRes.json();

      const response = await request.put(`/booking/${bookingid}`, {
        data: createBookingPayload({ firstname: "Hacker" }),
      });

      /**
       * BUG / UNEXPECTED BEHAVIOR:
       * The API returns 403 Forbidden instead of 401 Unauthorized for
       * unauthenticated requests. 401 would be more appropriate since
       * the user hasn't provided any credentials at all (the server
       * doesn't know WHO is making the request).
       * 403 implies the server knows the identity but denies permission.
       */
      expect(response.status()).toBe(403);
    });
  });

  // ──────────────────────────────────────────────
  // PARTIAL UPDATE
  // ──────────────────────────────────────────────
  test.describe("Partial Update Booking (PATCH /booking/:id)", () => {
    test("should partially update only the firstname", async ({
      request,
    }) => {
      // Create a booking
      const original = createBookingPayload({
        firstname: "Original",
        lastname: "PartialTest",
      });
      const createRes = await request.post("/booking", {
        data: original,
      });
      const { bookingid } = await createRes.json();

      const token = await getAuthToken(request);

      const response = await request.patch(`/booking/${bookingid}`, {
        data: {
          firstname: "Patched",
        },
        headers: {
          Cookie: `token=${token}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe("Patched");
      // Verify untouched fields persist
      expect(body.lastname).toBe("PartialTest");
      expect(body.totalprice).toBe(original.totalprice);
    });

    test("should partially update booking dates", async ({
      request,
    }) => {
      const original = createBookingPayload();
      const createRes = await request.post("/booking", {
        data: original,
      });
      const { bookingid } = await createRes.json();

      const token = await getAuthToken(request);

      const response = await request.patch(`/booking/${bookingid}`, {
        data: {
          bookingdates: {
            checkin: "2026-01-01",
            checkout: "2026-01-15",
          },
        },
        headers: {
          Cookie: `token=${token}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.bookingdates.checkin).toBe("2026-01-01");
      expect(body.bookingdates.checkout).toBe("2026-01-15");
      // Other fields should remain unchanged
      expect(body.firstname).toBe(original.firstname);
    });
  });

  // ──────────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────────
  test.describe("Delete Booking (DELETE /booking/:id)", () => {
    test("should delete a booking with token auth", async ({
      request,
    }) => {
      // Create a booking
      const createRes = await request.post("/booking", {
        data: createBookingPayload(),
      });
      const { bookingid } = await createRes.json();

      const token = await getAuthToken(request);

      const deleteRes = await request.delete(`/booking/${bookingid}`, {
        headers: {
          Cookie: `token=${token}`,
        },
      });

      /**
       * BUG / UNEXPECTED BEHAVIOR:
       * The API returns 201 Created for a DELETE operation instead of
       * 200 OK or 204 No Content. Using 201 for a deletion is semantically
       * incorrect — 201 indicates a new resource was created, not deleted.
       */
      expect(deleteRes.status()).toBe(201);

      // Verify the booking no longer exists
      const getRes = await request.get(`/booking/${bookingid}`);
      expect(getRes.status()).toBe(404);
    });

    test("should reject delete without authentication", async ({
      request,
    }) => {
      const createRes = await request.post("/booking", {
        data: createBookingPayload(),
      });
      const { bookingid } = await createRes.json();

      const deleteRes = await request.delete(`/booking/${bookingid}`);

      expect(deleteRes.status()).toBe(403);
    });
  });
});

// ──────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────
test.describe("Health Check (GET /ping)", () => {
  test("should confirm the API is up", async ({ request }) => {
    const response = await request.get("/ping");

    /**
     * BUG / UNEXPECTED BEHAVIOR:
     * The health check endpoint returns 201 Created instead of 200 OK.
     * A health check should return 200 to indicate the service is healthy.
     * 201 is semantically misleading here.
     */
    expect(response.status()).toBe(201);
  });
});
