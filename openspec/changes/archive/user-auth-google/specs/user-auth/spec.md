# User Auth Specification

## Purpose

Authenticated access via Google OAuth alongside existing guest mode.

## Requirements

### Requirement: Google OAuth Sign-In

The system MUST allow users to start sign-in with Google from `/login`.

#### Scenario: User initiates Google login

- GIVEN an unauthenticated visitor on `/login`
- WHEN they tap "Continuar con Google"
- THEN the system redirects to Google OAuth via Supabase
- AND returns to `/auth/callback` after success

#### Scenario: OAuth callback establishes session

- GIVEN a valid OAuth authorization code
- WHEN `/auth/callback` processes the exchange
- THEN a Supabase session cookie is set
- AND the user is redirected to the safe `next` path (default `/learn`)

### Requirement: Guest Mode Coexistence

The system MUST keep guest mode available without requiring authentication.

#### Scenario: Guest continues without login

- GIVEN a visitor chooses guest mode in onboarding
- WHEN they complete onboarding
- THEN they reach `/learn` without a Supabase session
- AND progress cookies continue to work

#### Scenario: Login optional from onboarding

- GIVEN a visitor selects "Crear cuenta" in onboarding
- WHEN they continue
- THEN they are sent to `/login` with return path to onboarding

### Requirement: Session Visibility

The system MUST expose whether the current request has an authenticated user.

#### Scenario: Nav shows login for guests

- GIVEN no Supabase session
- WHEN any page renders the nav bar
- THEN a link to `/login` is visible

#### Scenario: Nav shows user when signed in

- GIVEN an active Supabase session
- WHEN the nav bar renders
- THEN the user's display name or email is shown
- AND a logout action is available

### Requirement: Safe Redirects

The system MUST only allow internal post-auth redirects.

#### Scenario: External redirect blocked

- GIVEN `next=https://evil.com`
- WHEN callback or login resolves the redirect
- THEN the user lands on `/learn` (default safe path)
