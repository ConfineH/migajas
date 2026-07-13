# Design: User Auth with Google

## Technical Approach

Add Supabase Auth using `@supabase/ssr` cookie sessions. Testable redirect/session helpers live in `src/lib/domain/auth.ts`. UI stays Spanish; artifacts English per `openspec/config.yaml`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | Supabase Auth + Google | Roadmap Sprint 2+; built-in OAuth |
| Session transport | HTTP cookies via `@supabase/ssr` | Matches existing cookie pattern |
| Progress storage | Keep cookies for now | Minimize scope; DB sync later |
| Test layer | Domain unit tests in `test/domain/` | `strict_tdd: true` in config |

## Data Flow

```
/login → signInWithOAuth(google) → Google → /auth/callback → set session cookie → /learn
Onboarding "Crear cuenta" → /login?next=/onboarding
Guest path → cookies only (unchanged)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/domain/auth.ts` | Create | Redirect sanitization, auth mode |
| `test/domain/auth.test.ts` | Create | TDD tests |
| `src/lib/supabase/client.ts` | Create | Browser client |
| `src/lib/supabase/server.ts` | Create | Server client |
| `src/lib/supabase/middleware.ts` | Create | Session refresh helper |
| `src/middleware.ts` | Create | Wire session refresh |
| `src/app/auth/callback/route.ts` | Create | Code exchange |
| `src/app/login/page.tsx` | Create | Login UI |
| `src/app/login/actions.ts` | Create | Server actions (sign-in/out) |
| `src/components/GoogleSignInButton.tsx` | Create | Client OAuth trigger |
| `src/components/OnboardingFlow.tsx` | Modify | Link to login |
| `src/components/NavBar.tsx` | Modify | Auth state |
| `src/components/AppNavBar.tsx` | Modify | Pass user to NavBar |
| `.env.example` | Create | Supabase env template |

## Interfaces

```typescript
export type AuthMode = "guest" | "authenticated";

export function resolveAuthMode(userId: string | null | undefined): AuthMode;
export function sanitizePostAuthRedirect(next: string | null | undefined, fallback?: string): string;
export function buildOAuthCallbackUrl(origin: string, next?: string): string;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Redirect sanitization, auth mode | Vitest in `test/domain/auth.test.ts` |
| Component | Login button | Deferred |
| Integration | OAuth flow | Manual with Supabase project |

## Threat Matrix

N/A — no shell/subprocess/VCS automation boundaries.

## Migration / Rollout

No data migration. Configure Google OAuth in Supabase dashboard with callback `https://<host>/auth/callback`.

## Open Questions

- [ ] Supabase project URL/keys (user provides via `.env.local`)
