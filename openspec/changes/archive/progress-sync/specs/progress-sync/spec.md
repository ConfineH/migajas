# Progress Sync Specification

## Requirements

### Requirement: Guest-to-Account Merge on Login

The system MUST merge cookie progress into the user's Supabase row when they sign in.

#### Scenario: First login with guest progress

- GIVEN a guest with nivel-1 lesson completed in cookies
- WHEN they complete Google sign-in
- THEN their account stores the merged progress
- AND cookies reflect the merged state

#### Scenario: Login with existing account progress

- GIVEN an account with nivel-2 passed on another device
- AND local cookies with nivel-1 lesson only
- WHEN the user signs in
- THEN merged progress keeps nivel-2 completion AND nivel-1 lessons

### Requirement: Authenticated Persistence

The system MUST read and write progress from Supabase for authenticated users.

#### Scenario: Save progress while signed in

- GIVEN an authenticated session
- WHEN the user completes a lesson via API
- THEN progress is saved to Supabase
- AND remains available after cookie clear on same account

### Requirement: Guest Mode Unchanged

The system MUST keep cookie-only storage for guests.

#### Scenario: Guest without login

- GIVEN no Supabase session
- WHEN progress is saved
- THEN only cookies are updated

### Requirement: Merge Policy

The system MUST union lessons/practice steps, OR free-mode flag, keep best level completion per level, and cap attempts at 200.

#### Scenario: Competing level completions

- GIVEN remote nivel-1 mastery 80% and local nivel-1 mastery 50%
- WHEN merge runs
- THEN merged progress keeps 80%
