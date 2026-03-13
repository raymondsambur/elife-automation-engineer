Feature: Booking CRUD — Restful-Booker API
  As an API consumer
  I want to manage hotel bookings
  So that I can create, read, update, and delete bookings

  # ─── CREATE ───

  Scenario: Create a new booking with all fields
    When I create a booking with all fields
    Then the create booking response status should be 200
    And the response should have a numeric bookingid
    And the returned booking data should match what was sent

  Scenario: Create a booking without the optional additionalneeds field
    When I create a booking without additionalneeds
    Then the create booking response status should be 200
    And the response should have a numeric bookingid

  # ─── READ ───

  Scenario: Get a list of all booking IDs
    When I request all bookings
    Then the response status should be 200
    And the response body should be a non-empty array of booking IDs

  Scenario: Get a specific booking by ID
    Given a booking exists with firstname "ReadTest" and lastname "User"
    When I request the booking by its ID
    Then the response status should be 200
    And the booking firstname should be "ReadTest"
    And the booking lastname should be "User"

  Scenario: Request a non-existent booking returns 404
    # BUG: Response body is plain text, not JSON
    When I request booking ID 99999999
    Then the response status should be 404

  Scenario: Filter bookings by name
    Given a booking exists with a unique firstname and lastname "TestFilter"
    When I filter bookings by that unique firstname and lastname "TestFilter"
    Then the response status should be 200
    And the response should return at least one result

  # ─── UPDATE (Full) ───

  Scenario: Fully update a booking with token auth
    Given a booking exists
    And I have a valid auth token
    When I PUT update the booking with new data using token auth
    Then the update response status should be 200
    And the updated booking fields should reflect the new values

  Scenario: Fully update a booking with basic auth
    Given a booking exists
    When I PUT update the booking using basic auth
    Then the update response status should be 200

  Scenario: Update without authentication is rejected
    # BUG: Returns 403 Forbidden instead of 401 Unauthorized
    Given a booking exists
    When I PUT update the booking without any authentication
    Then the update response status should be 403

  # ─── PARTIAL UPDATE ───

  Scenario: Patch only the firstname of a booking
    Given a booking exists with firstname "Original" and lastname "PartialTest"
    And I have a valid auth token
    When I PATCH the booking firstname to "Patched"
    Then the patch response status should be 200
    And the booking firstname should be "Patched"
    And the booking lastname should still be "PartialTest"

  Scenario: Patch the booking dates of a booking
    Given a booking exists
    And I have a valid auth token
    When I PATCH the booking dates to checkin "2026-01-01" and checkout "2026-01-15"
    Then the patch response status should be 200
    And the booking checkin date should be "2026-01-01"
    And the booking checkout date should be "2026-01-15"

  # ─── DELETE ───

  Scenario: Delete a booking with token auth
    # BUG: Returns 201 Created instead of 200/204 for a deletion
    Given a booking exists
    And I have a valid auth token
    When I DELETE the booking using token auth
    Then the delete response status should be 201
    And the booking should no longer exist

  Scenario: Delete without authentication is rejected
    Given a booking exists
    When I DELETE the booking without authentication
    Then the delete response status should be 403

  # ─── HEALTH CHECK ───

  Scenario: Health check endpoint confirms API is up
    # BUG: Returns 201 instead of 200
    When I ping the health check endpoint
    Then the response status should be 201
