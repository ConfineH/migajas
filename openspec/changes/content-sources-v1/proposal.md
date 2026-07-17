# Proposal: Content Sources v1 (España)

## Intent

Expose canonical bibliography for Migajas educational content: BEDCA nutritional data, FEN/ADA clinical references, and Migajas methodology. Spain-only for v1.

## Capabilities

- `reference-guide` — MODIFIED: Fuentes tab + educational disclaimer
- `food-catalog` — MODIFIED: contextual source link on food cards when BEDCA-backed

## Success Criteria

- Central registry `content-sources.ts` with grouped ES sources
- `/guia` tab **Fuentes** lists sources with external links
- Educational disclaimer visible on Fuentes tab
- BEDCA-backed foods show source link on `FoodCard`
- `content-sources.test.ts` + suite green

## Out of Scope (v1)

- RD sources
- Admin CRUD for sources
- Supabase `source_id` column (infer from notes for now)

## Added in v1.1

- Lesson step `sourceIds` with footnotes in `LessonViewer`
