# intake-logging Specification

## Purpose

Allow opted-in authenticated users at nivel 3+ to log same-day carbohydrate intake from the food catalog for personal tracking and export.

## Requirements

### Requirement: Clinical mode gate

The system MUST allow intake logging only when the user is authenticated, has passed nivel 3 (or higher) guided exam, and has `clinical_mode_enabled` true on their profile.

#### Scenario: Eligible user opens diary

- GIVEN an authenticated user who passed the nivel-3 exam and enabled clinical mode
- WHEN they open the intake diary
- THEN they can add, edit, and delete intake entries for today

#### Scenario: Nivel 2 user blocked

- GIVEN an authenticated user who passed only nivel-2 exam
- WHEN they attempt to open the intake diary
- THEN they are redirected or shown guidance to complete nivel 3 first

#### Scenario: Clinical mode disabled

- GIVEN an authenticated user who passed nivel 3 but `clinical_mode_enabled` is false
- WHEN they attempt to log intake
- THEN logging is blocked and they are prompted to enable clinical mode in settings

#### Scenario: Guest blocked

- GIVEN a guest user without Supabase authentication
- WHEN they attempt any intake logging action
- THEN the request is rejected and they are prompted to sign in

### Requirement: Intake entry structure

Each intake entry MUST reference a catalog `food_id`, a `meal_slot` of `desayuno` | `comida` | `cena` | `snack`, a `logged_at` timestamp, and a `portion_multiplier` (positive number, default 1).

#### Scenario: Add entry with default portion

- GIVEN an eligible user selecting "Manzana pequeña" for meal slot `comida`
- WHEN they confirm add with portion multiplier 1
- THEN one intake entry is stored with that food, slot, and multiplier

#### Scenario: Invalid meal slot rejected

- GIVEN an eligible user submitting an intake entry
- WHEN `meal_slot` is not one of the four allowed values
- THEN the entry is not saved and a validation error is returned

### Requirement: Denormalized nutrition at write time

The system MUST compute and persist `carbs_g` and `rations` on each intake entry at write time using the user's profile `region_id` ration rule (10 g per ration for España; 15 g per ration for República Dominicana).

#### Scenario: Spain ration denormalization

- GIVEN a user with region "España" logging a food with 20 g carbs at multiplier 1
- WHEN the entry is saved
- THEN stored `carbs_g` is 20 and stored `rations` is 2.0

#### Scenario: RD ration denormalization

- GIVEN a user with region "República Dominicana" logging a food with 30 g carbs at multiplier 1
- WHEN the entry is saved
- THEN stored `carbs_g` is 30 and stored `rations` is 2.0

#### Scenario: Portion multiplier applied

- GIVEN a food with 10 g carbs per base portion
- WHEN the user logs with portion multiplier 1.5
- THEN stored `carbs_g` is 15 and rations are recalculated accordingly

### Requirement: Same-day CRUD

The system MUST support create, update portion multiplier, and delete for intake entries whose calendar date (user-local day) matches today; entries from prior days MUST NOT be editable or deletable through the diary UI in Phase 1.

#### Scenario: Edit today's entry

- GIVEN an intake entry logged today
- WHEN the user changes portion multiplier from 1 to 2
- THEN `carbs_g` and `rations` are recomputed and persisted

#### Scenario: Delete today's entry

- GIVEN an intake entry logged today
- WHEN the user deletes it
- THEN the entry is removed and daily totals decrease accordingly

#### Scenario: Prior-day entry read-only

- GIVEN an intake entry from yesterday
- WHEN the user views the diary
- THEN the entry is visible for history but edit and delete actions are unavailable

### Requirement: Data isolation

The system MUST enforce that each authenticated user can read and write only their own intake entries.

#### Scenario: Cross-user access denied

- GIVEN user A and user B each with intake entries
- WHEN user A requests user B's entry by identifier
- THEN the request returns not found or forbidden and no data is leaked
