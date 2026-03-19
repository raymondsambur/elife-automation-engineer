Feature: Shopping Cart and Checkout
  As a logged-in user of SauceDemo
  I want to manage my shopping cart and complete purchases
  So that I can buy products

  Background:
    Given I am logged in as "standard_user"
  # ─── Cart Operations ───

  @ATC-1
  Scenario: Add a single item to the cart
    When I add "Sauce Labs Backpack" to the cart
    Then the cart badge should show 1

  @ATC-2
  Scenario: Add multiple items and verify badge count
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I add "Sauce Labs Onesie" to the cart
    Then the cart badge should show 3

  @ATC-3
  Scenario: Remove an item from the cart
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart badge should show 1

  @ATC-4
  Scenario: Cart is empty when all items are removed
    Given I add "Sauce Labs Backpack" to the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart badge should not be visible

  @ATC-5
  Scenario: Cart items persist when navigating to the cart page
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    When I go to the cart
    Then the cart should contain "Sauce Labs Backpack"
    And the cart should contain "Sauce Labs Bike Light"

  @ATC-6
  Scenario: Remove item directly from cart page
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I go to the cart
    When I remove "Sauce Labs Backpack" from the cart page
    Then the cart should not contain "Sauce Labs Backpack"
    And the cart should contain "Sauce Labs Bike Light"
  # ─── Product Sorting ───

  @ATC-7
  Scenario: Sort products by price low to high
    When I sort products by "Price (low to high)"
    Then products should be sorted by price ascending

  @ATC-8
  Scenario: Sort products by price high to low
    When I sort products by "Price (high to low)"
    Then products should be sorted by price descending

  @ATC-9
  Scenario: Sort products by name A to Z
    When I sort products by "Name (A to Z)"
    Then products should be sorted by name ascending

  @ATC-10
  Scenario: Sort products by name Z to A
    When I sort products by "Name (Z to A)"
    Then products should be sorted by name descending
  # ─── Checkout Validation ───

  @ATC-11
  Scenario: Checkout requires first name
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "" last name "Doe" postal code "90210"
    And I continue checkout
    Then I should see the checkout error "First Name is required"

  @ATC-12
  Scenario: Checkout requires last name
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "" postal code "90210"
    And I continue checkout
    Then I should see the checkout error "Last Name is required"

  @ATC-13
  Scenario: Checkout requires postal code
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "Doe" postal code ""
    And I continue checkout
    Then I should see the checkout error "Postal Code is required"
  # ─── Full Purchase ───

  @ATC-14
  Scenario: Complete a full end-to-end purchase
    Given I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    When I fill in checkout with first name "Jane" last name "Doe" postal code "90210"
    And I continue checkout
    Then the total should equal subtotal plus tax
    When I finish the purchase
    Then I should see the order confirmation
