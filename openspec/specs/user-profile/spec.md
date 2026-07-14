# user-profile Specification

## Purpose

Persist per-user preferences and clinical-mode eligibility flags for authenticated users across devices.

## Requirements

### Requirement: User profile persistence

The system MUST store one profile row per authenticated user with: `region_id` (España | República Dominicana), optional `daily_carb_goal_g` (positive integer grams), and `clinical_mode_enabled` (boolean, default false).

#### Scenario: Profile created on first authenticated session

- GIVEN a user who signs in for the first time with onboarding cookie region "España"
- WHEN authentication completes
- THEN a `user_profiles` row exists for that user with `region_id` "España" and `clinical_mode_enabled` false

#### Scenario: Guest has no profile row

- GIVEN a guest user with onboarding data in cookies only
- WHEN they browse the app without signing in
- THEN no `user_profiles` row is created or required

### Requirement: Onboarding cookie sync on login

The system MUST copy region and daily carb goal from the onboarding cookie into the user profile when the user authenticates, using a merge strategy where existing non-null profile fields take precedence over cookie values.

#### Scenario: First login inherits cookie region and goal

- GIVEN a guest cookie with region "República Dominicana" and `daily_carb_goal_g` 180
- WHEN the user completes sign-in and has no existing profile row
- THEN the new profile row has `region_id` "República Dominicana" and `daily_carb_goal_g` 180

#### Scenario: Existing profile not overwritten by stale cookie

- GIVEN an authenticated user with profile `daily_carb_goal_g` 200
- AND a cookie still holding goal 150 from an earlier session
- WHEN they sign in again on a new device
- THEN the profile keeps `daily_carb_goal_g` 200

### Requirement: Settings editing

The system MUST allow authenticated users to edit `region_id`, `daily_carb_goal_g`, and `clinical_mode_enabled` from account settings.

#### Scenario: User updates daily carb goal

- GIVEN an authenticated user on the settings page
- WHEN they save `daily_carb_goal_g` 160
- THEN the profile persists 160 and subsequent diary totals compare against 160

#### Scenario: Invalid goal rejected

- GIVEN an authenticated user on the settings page
- WHEN they submit `daily_carb_goal_g` 0 or a non-numeric value
- THEN the save is rejected with a validation error and the prior value is unchanged

### Requirement: Clinical mode opt-in flag

The system MUST treat `clinical_mode_enabled` as an explicit user opt-in; it MUST default to false and MUST NOT be enabled automatically without user action.

#### Scenario: Clinical mode off by default

- GIVEN a newly created profile after first login
- WHEN the user has not opted in
- THEN `clinical_mode_enabled` is false and intake logging routes are inaccessible
