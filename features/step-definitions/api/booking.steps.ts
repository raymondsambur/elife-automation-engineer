import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { APIResponse } from "@playwright/test";
import { PlaywrightWorld } from "../../support/world";
import { ApiCredentials, createBookingPayload, BookingPayload } from "../../../src/data";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getAuthToken(world: PlaywrightWorld): Promise<string> {
  const res = await world.apiRequest.post("/auth", {
    data: ApiCredentials.valid,
  });
  const body = await res.json();
  return body.token as string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Given — test setup
// ─────────────────────────────────────────────────────────────────────────────

Given("a booking exists", async function (this: PlaywrightWorld) {
  const payload = createBookingPayload();
  const res = await this.apiRequest.post("/booking", { data: payload });
  const body = await res.json();
  this.store.bookingId = body.bookingid as number;
  this.store.originalPayload = payload;
});

Given(
  "a booking exists with firstname {string} and lastname {string}",
  async function (this: PlaywrightWorld, firstname: string, lastname: string) {
    const payload = createBookingPayload({ firstname, lastname });
    const res = await this.apiRequest.post("/booking", { data: payload });
    const body = await res.json();
    this.store.bookingId = body.bookingid as number;
    this.store.originalPayload = payload;
  }
);

Given(
  "a booking exists with a unique firstname and lastname {string}",
  async function (this: PlaywrightWorld, lastname: string) {
    const uniqueName = `Filter${Date.now()}`;
    const payload = createBookingPayload({ firstname: uniqueName, lastname });
    const res = await this.apiRequest.post("/booking", { data: payload });
    const body = await res.json();
    this.store.bookingId = body.bookingid as number;
    this.store.uniqueFirstname = uniqueName;
    this.store.originalPayload = payload;
  }
);

Given("I have a valid auth token", async function (this: PlaywrightWorld) {
  this.store.token = await getAuthToken(this);
});

// ─────────────────────────────────────────────────────────────────────────────
// When — Create
// ─────────────────────────────────────────────────────────────────────────────

When("I create a booking with all fields", async function (this: PlaywrightWorld) {
  const payload = createBookingPayload();
  this.store.createPayload = payload;
  const res = await this.apiRequest.post("/booking", { data: payload });
  this.store.createResponse = res;
  this.store.createBody = await res.json();
});

When("I create a booking without additionalneeds", async function (this: PlaywrightWorld) {
  const payload = createBookingPayload();
  delete payload.additionalneeds;
  this.store.createPayload = payload;
  const res = await this.apiRequest.post("/booking", { data: payload });
  this.store.createResponse = res;
  this.store.createBody = await res.json();
});

// ─────────────────────────────────────────────────────────────────────────────
// When — Read
// ─────────────────────────────────────────────────────────────────────────────

When("I request all bookings", async function (this: PlaywrightWorld) {
  const res = await this.apiRequest.get("/booking");
  this.store.lastResponse = res;
  this.store.lastBody = await res.json();
});

When("I request the booking by its ID", async function (this: PlaywrightWorld) {
  const id = this.store.bookingId as number;
  const res = await this.apiRequest.get(`/booking/${id}`);
  this.store.lastResponse = res;
  this.store.lastBody = await res.json();
});

When("I request booking ID {int}", async function (this: PlaywrightWorld, id: number) {
  const res = await this.apiRequest.get(`/booking/${id}`);
  this.store.lastResponse = res;
});

When(
  "I filter bookings by that unique firstname and lastname {string}",
  async function (this: PlaywrightWorld, lastname: string) {
    const firstname = this.store.uniqueFirstname as string;
    const res = await this.apiRequest.get(
      `/booking?firstname=${firstname}&lastname=${lastname}`
    );
    this.store.lastResponse = res;
    this.store.lastBody = await res.json();
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// When — Update (PUT)
// ─────────────────────────────────────────────────────────────────────────────

When(
  "I PUT update the booking with new data using token auth",
  async function (this: PlaywrightWorld) {
    const id = this.store.bookingId as number;
    const token = this.store.token as string;
    const updated: BookingPayload = {
      firstname: "Updated",
      lastname: "Guest",
      totalprice: 275,
      depositpaid: false,
      bookingdates: { checkin: "2025-09-01", checkout: "2025-09-15" },
      additionalneeds: "Dinner",
    };
    this.store.updatedPayload = updated;
    const res = await this.apiRequest.put(`/booking/${id}`, {
      data: updated,
      headers: { Cookie: `token=${token}` },
    });
    this.store.lastResponse = res;
    this.store.lastBody = await res.json();
  }
);

When("I PUT update the booking using basic auth", async function (this: PlaywrightWorld) {
  const id = this.store.bookingId as number;
  const credentials = Buffer.from("admin:password123").toString("base64");
  const updated: BookingPayload = {
    firstname: "BasicAuth",
    lastname: "Update",
    totalprice: 999,
    depositpaid: true,
    bookingdates: { checkin: "2025-12-01", checkout: "2025-12-20" },
    additionalneeds: "Parking",
  };
  const res = await this.apiRequest.put(`/booking/${id}`, {
    data: updated,
    headers: { Authorization: `Basic ${credentials}` },
  });
  this.store.lastResponse = res;
  this.store.lastBody = await res.json();
});

When(
  "I PUT update the booking without any authentication",
  async function (this: PlaywrightWorld) {
    const id = this.store.bookingId as number;
    const res = await this.apiRequest.put(`/booking/${id}`, {
      data: createBookingPayload({ firstname: "Hacker" }),
    });
    this.store.lastResponse = res;
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// When — Partial Update (PATCH)
// ─────────────────────────────────────────────────────────────────────────────

When(
  "I PATCH the booking firstname to {string}",
  async function (this: PlaywrightWorld, firstname: string) {
    const id = this.store.bookingId as number;
    const token = this.store.token as string;
    const res = await this.apiRequest.patch(`/booking/${id}`, {
      data: { firstname },
      headers: { Cookie: `token=${token}` },
    });
    this.store.lastResponse = res;
    this.store.lastBody = await res.json();
  }
);

When(
  "I PATCH the booking dates to checkin {string} and checkout {string}",
  async function (this: PlaywrightWorld, checkin: string, checkout: string) {
    const id = this.store.bookingId as number;
    const token = this.store.token as string;
    const res = await this.apiRequest.patch(`/booking/${id}`, {
      data: { bookingdates: { checkin, checkout } },
      headers: { Cookie: `token=${token}` },
    });
    this.store.lastResponse = res;
    this.store.lastBody = await res.json();
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// When — Delete
// ─────────────────────────────────────────────────────────────────────────────

When("I DELETE the booking using token auth", async function (this: PlaywrightWorld) {
  const id = this.store.bookingId as number;
  const token = this.store.token as string;
  const res = await this.apiRequest.delete(`/booking/${id}`, {
    headers: { Cookie: `token=${token}` },
  });
  this.store.lastResponse = res;
});

When("I DELETE the booking without authentication", async function (this: PlaywrightWorld) {
  const id = this.store.bookingId as number;
  const res = await this.apiRequest.delete(`/booking/${id}`);
  this.store.lastResponse = res;
});

// ─────────────────────────────────────────────────────────────────────────────
// When — Health Check
// ─────────────────────────────────────────────────────────────────────────────

When("I ping the health check endpoint", async function (this: PlaywrightWorld) {
  const res = await this.apiRequest.get("/ping");
  this.store.lastResponse = res;
});

// ─────────────────────────────────────────────────────────────────────────────
// Then — Assertions
// ─────────────────────────────────────────────────────────────────────────────

Then("the response status should be {int}", async function (this: PlaywrightWorld, status: number) {
  const res = this.store.lastResponse as APIResponse;
  expect(res.status()).toBe(status);
});

Then(
  "the create booking response status should be {int}",
  async function (this: PlaywrightWorld, status: number) {
    const res = this.store.createResponse as APIResponse;
    expect(res.status()).toBe(status);
  }
);

Then("the response should have a numeric bookingid", async function (this: PlaywrightWorld) {
  const body = this.store.createBody as any;
  expect(body).toHaveProperty("bookingid");
  expect(typeof body.bookingid).toBe("number");
});

Then(
  "the returned booking data should match what was sent",
  async function (this: PlaywrightWorld) {
    const body = this.store.createBody as any;
    const payload = this.store.createPayload as BookingPayload;
    expect(body.booking.firstname).toBe(payload.firstname);
    expect(body.booking.lastname).toBe(payload.lastname);
    expect(body.booking.totalprice).toBe(payload.totalprice);
    expect(body.booking.depositpaid).toBe(payload.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    expect(body.booking.additionalneeds).toBe(payload.additionalneeds);
  }
);

Then(
  "the response body should be a non-empty array of booking IDs",
  async function (this: PlaywrightWorld) {
    const body = this.store.lastBody as any;
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty("bookingid");
  }
);

Then(
  "the booking firstname should be {string}",
  async function (this: PlaywrightWorld, firstname: string) {
    const body = this.store.lastBody as any;
    expect(body.firstname).toBe(firstname);
  }
);

Then(
  "the booking lastname should be {string}",
  async function (this: PlaywrightWorld, lastname: string) {
    const body = this.store.lastBody as any;
    expect(body.lastname).toBe(lastname);
  }
);

Then("the response should return at least one result", async function (this: PlaywrightWorld) {
  const body = this.store.lastBody as any;
  expect(Array.isArray(body)).toBeTruthy();
  expect(body.length).toBeGreaterThanOrEqual(1);
});

Then(
  "the update response status should be {int}",
  async function (this: PlaywrightWorld, status: number) {
    const res = this.store.lastResponse as APIResponse;
    expect(res.status()).toBe(status);
  }
);

Then(
  "the updated booking fields should reflect the new values",
  async function (this: PlaywrightWorld) {
    const body = this.store.lastBody as any;
    expect(body.firstname).toBe("Updated");
    expect(body.lastname).toBe("Guest");
    expect(body.totalprice).toBe(275);
    expect(body.depositpaid).toBe(false);
    expect(body.additionalneeds).toBe("Dinner");
  }
);

Then(
  "the patch response status should be {int}",
  async function (this: PlaywrightWorld, status: number) {
    const res = this.store.lastResponse as APIResponse;
    expect(res.status()).toBe(status);
  }
);

Then(
  "the booking lastname should still be {string}",
  async function (this: PlaywrightWorld, lastname: string) {
    const body = this.store.lastBody as any;
    expect(body.lastname).toBe(lastname);
  }
);

Then(
  "the booking checkin date should be {string}",
  async function (this: PlaywrightWorld, date: string) {
    const body = this.store.lastBody as any;
    expect(body.bookingdates.checkin).toBe(date);
  }
);

Then(
  "the booking checkout date should be {string}",
  async function (this: PlaywrightWorld, date: string) {
    const body = this.store.lastBody as any;
    expect(body.bookingdates.checkout).toBe(date);
  }
);

Then(
  "the delete response status should be {int}",
  async function (this: PlaywrightWorld, status: number) {
    const res = this.store.lastResponse as APIResponse;
    expect(res.status()).toBe(status);
  }
);

Then("the booking should no longer exist", async function (this: PlaywrightWorld) {
  const id = this.store.bookingId as number;
  const res = await this.apiRequest.get(`/booking/${id}`);
  expect(res.status()).toBe(404);
});
