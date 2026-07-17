# Proposal: Food Fiber Enrichment (España)

## Intent

Backfill BEDCA-oriented fiber data on staple Spain catalog foods so FoodCard fiber badges are useful beyond 2 items.

## Approach

- `scripts/enrich-food-fiber.mjs` — id → fiber g/100g map, writes `fiberG` + notes
- Notes format keeps Supabase compatibility (no DB migration)
- 51 curriculum-relevant staples

## Success Criteria

- ≥40 Spain foods with resolvable fiber
- Key foods (pan integral, legumbres, arroz integral) covered
- Seed regenerated, tests green
