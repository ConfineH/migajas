# Proposal: Product Phase C ES (fiber + glycemic)

## Intent

Surface deferred product features from pedagogical v2: informative fiber on food cards and a light glycemic impact module, Spain-first.

## Capabilities

- `food-catalog` — MODIFIED: show fiber (informative) and glycemic impact on cards
- `reference-guide` — MODIFIED: glycemic guide panel in Reglas tab

## Success Criteria

- FoodCard shows glycemic impact from existing `difficulty` field (Baja/Media/Alta)
- Fiber shown when known from `fiberG` or parsed from `notes`
- `/guia` Reglas includes IG orientativo panel
- Rations unchanged (HC totales policy)
- Tests green

## Out of Scope

- Photo exercises
- RD-specific IG copy
- DB column for fiber_g
