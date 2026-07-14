# Design: Reference Guide

## Routes

| Route | Purpose |
|-------|---------|
| `/guia` | Tabbed reference: Reglas · Alimentos · Calculadora |

## UI Structure

```
/guia
├── PageHeader
├── Tabs: [ Reglas | Alimentos | Calculadora ]
├── ReglasTab
│   ├── RationRuleCard (10 g = 1 ración)
│   ├── ConversionTable (1–5 raciones ↔ grams)
│   └── TipsList (redondeo, leer etiquetas)
├── FoodsTab (reuse CatalogClient patterns, read-only)
└── CalculatorTab (grams input → rations, optional reverse)
```

## Files

| File | Action |
|------|--------|
| `src/lib/domain/reference-guide.ts` | Conversion table data, formatters |
| `test/domain/reference-guide.test.ts` | TDD |
| `src/app/guia/page.tsx` | Server page |
| `src/components/reference-guide/*` | Tabs + widgets |
| `src/components/NavBar.tsx` | Add “Guía” link (always visible) |
| `openspec/specs/reference-guide/spec.md` | Delta spec |

## Data

Static conversion table in domain (no DB). Foods from existing `getFoods()` / content cache.

## Pedagogy

- Link from `LessonViewer` footer: “Abrir guía de referencia”
- No progress impact from using Guía
