# Design: MVP Foundation

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home
│   ├── onboarding/         # Country + guest flow
│   └── catalog/            # Food catalog
├── components/             # UI components
├── lib/
│   ├── domain/             # Pure business logic (tested)
│   │   ├── rations.ts
│   │   └── foods.ts
│   └── data/
│       └── foods.json      # Seed from CSV
test/
├── domain/                 # Unit tests (TDD)
└── components/             # Component tests
```

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Ration unit | 10g carbs = 1 ration | Spain standard per PRD |
| State persistence | HTTP cookies | PRD forbids localStorage |
| Data layer | JSON seed file | Sprint 0; Supabase in Sprint 2+ |
| Test runner | Vitest in `test/` | User requested TDD + test folder |
| Styling | Tailwind, mobile-first | Architecture doc requirement |

## Data Model (MVP)

```typescript
interface FoodItem {
  id: string;
  country: string;
  category: string;
  name: string;
  portionText: string;
  grams: number;
  carbsG: number;
  difficulty: "Baja" | "Media" | "Alta";
  itemType: "base" | "mixed" | "modulator";
  notes: string;
}
```

Rations are computed at runtime via `calculateRations(carbsG)`.

## UI Flow

1. **Home** → CTA "Empezar" → Onboarding
2. **Onboarding** → Select España → Guest mode → Ration intro → Catalog
3. **Catalog** → Browse/filter/search foods

## File Changes

- `src/lib/domain/rations.ts` — ration calculation
- `src/lib/domain/foods.ts` — catalog queries
- `src/lib/data/foods.json` — 37 Spanish foods from CSV
- `src/components/*` — reusable UI
- `src/app/*` — pages
