# Design: Content Sources v1

## Registry

- `src/lib/domain/content-sources.ts` — canonical sources, disclaimer, `inferFoodSourceId()`
- Spain-only via `regionIds: ["es"]`

## UI

| Surface | Behavior |
|---------|----------|
| `/guia?tab=fuentes` | Fuentes tab with grouped list + disclaimer |
| `FoodCard` | `Fuente: BEDCA ↗` when notes contain BEDCA |
| Reglas tab | Link to Fuentes tab |

## Food source inference

No DB migration in v1. `inferFoodSourceId()` reads optional `sourceId` or `notes` containing `BEDCA`.

## Sources (v1)

| ID | Scope |
|----|-------|
| `bedca` | nutrition-data |
| `fen`, `ada` | clinical-guideline |
| `migajas-exchange-unit`, `migajas-fiber-policy`, `migajas-modulators` | methodology |
