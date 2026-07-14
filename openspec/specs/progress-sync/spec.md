# Progress Sync Specification

## Purpose

Persist and merge learning progress for authenticated users across devices.

## Requirements

### Requirement: Guest-to-Account Merge on Login

The system MUST merge cookie progress into the user's Supabase row when they sign in.

#### Scenario: First login with guest progress

- GIVEN a guest with nivel-1 lesson completed in cookies
- WHEN they complete Google sign-in
- THEN their account stores the merged progress

### Requirement: Authenticated Persistence

The system MUST read and write progress from Supabase for authenticated users.

#### Scenario: Save progress while signed in

- GIVEN an authenticated session
- WHEN the user completes a lesson via API
- THEN progress is saved to Supabase

### Requirement: Guest Mode Unchanged

The system MUST keep cookie-only storage for guests.

### Requirement: Merge Policy

The system MUST union lessons/practice steps, OR free-mode flag, keep best level completion per level, and cap attempts at 200.

### Requirement: Profile sync on authentication

The system MUST synchronize onboarding cookie values for `region_id` and `daily_carb_goal_g` into `user_profiles` when an authenticated session is established, using the same merge policy as user-profile: create from cookie when no profile exists; preserve existing non-null profile fields on subsequent logins.

#### Scenario: First login creates profile from cookie

- GIVEN a guest with cookie region "España" and goal 150 who completes sign-in
- WHEN auth merge runs
- THEN a profile row is created with those values alongside learning-progress merge

#### Scenario: Profile sync does not block progress merge

- GIVEN a guest with nivel-1 lesson progress in cookies and region in cookies
- WHEN they sign in
- THEN learning progress merge and profile sync both complete without data loss

#### Scenario: Returning user keeps DB profile

- GIVEN an existing profile with region "República Dominicana" and goal 200
- AND a cookie still holding region "España"
- WHEN the user signs in on another device
- THEN learning progress merges per existing policy and profile region remains "República Dominicana" with goal 200

### Requirement: Profile readable for authenticated sessions

After sync, authenticated clients MUST read region and carb goal from the user profile as the source of truth for diary, export, and catalog region filtering; the onboarding cookie MAY remain a cache for guests only.

#### Scenario: Authenticated app uses profile region

- GIVEN an authenticated user with profile region "República Dominicana"
- WHEN the diary computes rations for a new entry
- THEN the 15 g per ration rule is applied regardless of stale cookie region
