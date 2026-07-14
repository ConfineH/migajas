# Proposal: User Auth with Google

## Intent

Enable registered users to sign in with Google so progress can sync across devices, while keeping guest mode as the default fast path.

## Scope

### In Scope
- Supabase Auth with Google OAuth provider
- Login page (`/login`) with Google button and guest fallback
- OAuth callback route and session middleware
- Domain auth helpers (tested via TDD in `test/domain/`)
- Onboarding "Crear cuenta" links to real login flow
- Nav shows session state (login / user / logout)

### Out of Scope
- Migrating cookie progress to Supabase DB (deferred)
- Email/password auth
- Account deletion UI
- RLS-backed user tables

## Capabilities

### New Capabilities
- `user-auth`: Google OAuth sign-in, session detection, guest coexistence

### Modified Capabilities
- None

## Approach

Supabase Auth + `@supabase/ssr` for Next.js App Router. Pure auth logic in `src/lib/domain/auth.ts` with Vitest tests first. Guest cookies unchanged; authenticated users identified by Supabase session.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/domain/auth.ts` | New | Testable auth helpers |
| `src/lib/supabase/` | New | Browser/server/middleware clients |
| `src/middleware.ts` | New | Session refresh |
| `src/app/login/` | New | Login page |
| `src/app/auth/callback/` | New | OAuth callback |
| `src/components/OnboardingFlow.tsx` | Modified | Real account path |
| `src/components/NavBar.tsx` | Modified | Auth links |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing Supabase env vars | Med | `.env.example` + graceful UI message |
| OAuth misconfiguration | Med | Document callback URL in design |

## Rollback Plan

Remove `src/middleware.ts`, supabase lib, login/callback routes; revert onboarding/NavBar. Guest mode unaffected.

## Dependencies

- Supabase project with Google provider enabled
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Success Criteria

- [ ] Domain auth tests pass (TDD)
- [ ] `/login` shows Google sign-in in Spanish
- [ ] Guest mode still works without login
- [ ] Authenticated session detectable server-side
