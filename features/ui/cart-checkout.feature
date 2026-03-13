Feature: Shopping Cart and Checkout
  As a logged-in user of SauceDemo
  I want to manage my shopping cart and complete purchases
  So that I can buy products

  Background:
    Given I am logged in as "standard_user"

  # ─── Cart Operations ───

  Scenario: Add a single item to the cart
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1

  Scenario: Add multiple items and verify badge count
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I add "Sauce Labs Onesie" to the cart
    Then the cart badge should show 3

  Scenario: Remove an item from the cart
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart badge should show 1

  Scenario: Cart is empty when all items are removed
    Given I add "Sauce Labs Backpack" to the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart badge should not be visible

  Scenario: Cart items persist when navigating to the cart page
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    When I go to the cart
    Then the cart should contain "Sauce Labs Backpack"
    And the cart should contain "Sauce Labs Bike Light"

  Scenario: Remove item directly from cart page
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I go to the cart
    When I remove "Sauce Labs Backpack" from the cart page
    Then the cart should not contain "Sauce Labs Backpack"
    And the cart should contain "Sauce Labs Bike Light"

  # ─── Product Sorting ───

  Scenario: Sort products by price low to high
    When I sort products by "Price (low to high)"
    Then products should be sorted by price ascending

  Scenario: Sort products by price high to low
    When I sort products by "Price (high to low)"
    Then products should be sorted by price descending

  Scenario: Sort products by name A to Z
    When I sort products by "Name (A to Z)"
    Then products should be sorted by name ascending

  Scenario: Sort products by name Z to A
    When I sort products by "Name (Z to A)"
    Then products should be sorted by name descending

  # ─── Checkout Validation ───

  Scenario: Checkout requires first name
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "" last name "Doe" postal code "90210"
    And I continue checkout
    Then I should see the checkout error "First Name is required"

  Scenario: Checkout requires last name
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "" postal code "90210"
    And I continue checkout
    Then I should see the checkout error "Last Name is required"

  Scenario: Checkout requires postal code
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "Doe" postal code ""
    And I continue checkout
    Then I should see the checkout error "Postal Code is required"

  # ─── Full Purchase ───

  Scenario: Complete a full end-to-end purchase
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "Doe" postal code "90210"
    And I continue checkout
    Then the total should equal subtotal plus tax
    When I finish the purchase
    Then I should see the order confirmation
