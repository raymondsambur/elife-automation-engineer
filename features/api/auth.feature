Feature: Authentication — Restful-Booker API
  As an API consumer
  I want to obtain an auth token
  So that I can perform protected CRUD operations

  @smoke @ATC-21
  Scenario: Obtain a token with valid credentials
    When I request a token with username "admin" and password "password123"
    Then the auth response status should be 200
    And the response should contain a non-empty token

  @ATC-22
  Scenario: Invalid credentials return a Bad credentials reason
    # BUG: API returns 200 instead of 401 Unauthorized for bad credentials
    When I request a token with username "admin" and password "wrongpassword"
    Then the auth response status should be 200
    And the response should contain reason "Bad credentials"

  @ATC-23
  Scenario: Missing body returns Bad credentials reason
    # BUG: API returns 200 instead of 400 Bad Request for empty body
    When I request a token with an empty body
    Then the auth response status should be 200
    And the response should contain reason "Bad credentials"
