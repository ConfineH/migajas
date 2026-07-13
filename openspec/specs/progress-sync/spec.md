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
