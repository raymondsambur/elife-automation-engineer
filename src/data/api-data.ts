/**
 * Test data for Restful-Booker API tests.
 */
export const ApiCredentials = {
  valid: {
    username: "admin",
    password: "password123",
  },
  invalid: {
    username: "admin",
    password: "wrongpassword",
  },
} as const;

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** Factory function to generate unique booking data per test run */
export function createBookingPayload(
  overrides: Partial<BookingPayload> = {}
): BookingPayload {
  return {
    firstname: "John",
    lastname: "Doe",
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: "2025-06-01",
      checkout: "2025-06-10",
    },
    additionalneeds: "Breakfast",
    ...overrides,
  };
}
