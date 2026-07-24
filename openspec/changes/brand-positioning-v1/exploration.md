# Exploration: brand-positioning-v1

## Current State

- Product copy lives inline in `HomeAnimated.tsx`, `layout.tsx`, `opengraph-image.tsx`, `OnboardingFlow.tsx`.
- Visual tokens defined in `globals.css` (crema, sage, terracotta; Playfair + DM Sans).
- Compliance guardrails exist in `docs/commercial/LEGAL/MDR-POSITION.md` but not in marketing code.
- No brand editorial system or content library for social media.
- User validated strategic draft: arc **Entender → Practicar → Confiar**, 6 editorial series, educational tone.

## Affected Areas

- `src/lib/domain/brand-positioning.ts` — new canonical copy + forbidden patterns
- `test/domain/brand-positioning.test.ts` — Vitest guardrails
- `src/components/home/HomeAnimated.tsx` — wire hero copy
- `src/app/layout.tsx` — wire SEO metadata
- `docs/BRAND_EDITORIAL_SYSTEM.md` — editorial system v0.1
- `docs/content-library/*` — starter libraries + batch-01

## Recommendation

Mirror Meant To pattern: strategic doc → code constants → tests on active surfaces. Keep clinical mode as secondary layer in copy guardrails. Add explicit ES/RD territory rule for social content.

## Risks

- Over-scoping landing rewrite — mitigate with minimal wiring to canonical constants only.
- Social copy drifting from MDR — mitigate with `FORBIDDEN_MARKETING_PATTERNS` + editorial disclaimers in docs.

## Ready for Proposal

Yes.
