# User Auth Specification

## Purpose

Authenticated access via Google OAuth and email/password alongside existing guest mode.

## Requirements

### Requirement: Google OAuth Sign-In

The system MUST allow users to start sign-in with Google from `/login`.

#### Scenario: User initiates Google login

- GIVEN an unauthenticated visitor on `/login`
- WHEN they tap "Continuar con Google"
- THEN the system redirects to Google OAuth via Supabase
- AND returns to `/auth/callback` after success

### Requirement: Email and Password Auth

The system MUST allow users to sign in or sign up with email and password from `/login`.

#### Scenario: User signs in with email

- GIVEN an existing account with confirmed email
- WHEN they submit valid credentials on `/login`
- THEN the system creates a Supabase session
- AND syncs guest progress before redirecting to `/learn`

#### Scenario: User signs up with email

- GIVEN email confirmation is enabled in Supabase
- WHEN they create an account with email and password
- THEN the system sends a confirmation email
- AND shows instructions to check the inbox

#### Scenario: User confirms email

- GIVEN a valid confirmation link from Supabase
- WHEN the callback exchanges the auth code
- THEN the user lands on `/auth/confirmed`
- AND can continue to the course

### Requirement: Password Recovery

The system MUST allow users to request a password reset link.

#### Scenario: User requests password reset

- GIVEN a visitor on `/login/forgot-password`
- WHEN they submit their email
- THEN the system sends a recovery email via Supabase
- AND shows a neutral success message

#### Scenario: User sets a new password

- GIVEN a valid recovery link
- WHEN they submit a new password on `/auth/reset-password`
- THEN the password is updated
- AND the user is redirected to `/learn`

### Requirement: Guest Mode Coexistence

The system MUST keep guest mode available without requiring authentication.

#### Scenario: Guest continues without login

- GIVEN a visitor chooses guest mode in onboarding
- WHEN they complete onboarding
- THEN they reach `/learn` without a Supabase session

### Requirement: Session Visibility

The system MUST expose whether the current request has an authenticated user.

#### Scenario: Nav shows login for guests

- GIVEN no Supabase session
- WHEN any page renders the nav bar
- THEN a link to `/login` is visible

### Requirement: Safe Redirects

The system MUST only allow internal post-auth redirects.

#### Scenario: External redirect blocked

- GIVEN `next=https://evil.com`
- WHEN callback resolves the redirect
- THEN the user lands on `/learn`
