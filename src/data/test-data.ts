/**
 * Test data for SauceDemo UI tests.
 *
 * Centralized here so that credential or data changes
 * only need to be updated in one place.
 */
export const Users = {
  standard: {
    username: "standard_user",
    password: "secret_sauce",
  },
  lockedOut: {
    username: "locked_out_user",
    password: "secret_sauce",
  },
  problem: {
    username: "problem_user",
    password: "secret_sauce",
  },
} as const;

export const Products = {
  backpack: "Sauce Labs Backpack",
  bikeLight: "Sauce Labs Bike Light",
  boltTShirt: "Sauce Labs Bolt T-Shirt",
  fleeceJacket: "Sauce Labs Fleece Jacket",
  onesie: "Sauce Labs Onesie",
  allTheThings: "Test.allTheThings() T-Shirt (Red)",
} as const;

export const CheckoutInfo = {
  valid: {
    firstName: "Jane",
    lastName: "Doe",
    postalCode: "90210",
  },
} as const;
