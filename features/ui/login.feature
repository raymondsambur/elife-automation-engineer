Feature: Login Flow
  As a user of SauceDemo
  I want to authenticate with my credentials
  So that I can access the product inventory

  Background:
    Given I am on the SauceDemo login page

  @smoke @ATC-15
  Scenario: Successful login with valid credentials
    When I log in as "standard_user" with password "secret_sauce"
    Then I should be on the inventory page

  @ATC-16
  Scenario: Locked out user sees an error
    When I log in as "locked_out_user" with password "secret_sauce"
    Then I should see the error "Sorry, this user has been locked out"

  @ATC-17
  Scenario: Empty username shows validation error
    When I log in with username "" and password "secret_sauce"
    Then I should see the error "Username is required"

  @ATC-18
  Scenario: Empty password shows validation error
    When I log in with username "standard_user" and password ""
    Then I should see the error "Password is required"

  @ATC-19
  Scenario: Invalid credentials show rejection error
    When I log in with username "invalid_user" and password "wrong_password"
    Then I should see the error "Username and password do not match any user in this service"

  @ATC-20
  Scenario: Error message can be dismissed
    When I log in with username "" and password ""
    And I should see the error "Username is required"
    When I dismiss the error message
    Then I should not see an error message
