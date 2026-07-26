# Migajas — Documentación de marca y marketing

Índice de decisiones, copy, editorial y producción de contenido. **Objetivo:** que nadie tenga que reconstruir el contexto desde cero ni improvisar con IA sin sistema.

---

## Empieza aquí

| Si necesitas… | Lee |
|---------------|-----|
| Por qué decidimos X y si nos desviamos | [DECISIONS.md](./DECISIONS.md) |
| Posicionamiento, audiencia, arco, anti-referencias | [STRATEGY.md](./STRATEGY.md) |
| Textos canónicos (app, SEO, redes) | [COPY-SEO-SOCIAL.md](./COPY-SEO-SOCIAL.md) |
| Instagram: series, plantillas, batch, briefs IA | [../BRAND_EDITORIAL_SYSTEM.md](../BRAND_EDITORIAL_SYSTEM.md) |
| Spec visual 1080×1080 (plantillas) | [../BRAND_CANVA_TEMPLATES_v0.1.md](../BRAND_CANVA_TEMPLATES_v0.1.md) |
| Producción HTML/ChatGPT y flujo | [CREATIVE-PRODUCTION.md](./CREATIVE-PRODUCTION.md) |
| Compliance en comunicación (MDR, disclaimers) | [../commercial/LEGAL/MDR-POSITION.md](../commercial/LEGAL/MDR-POSITION.md) |
| Modelo B2B / licencia territorial | [../commercial/README-BUYER.md](../commercial/README-BUYER.md) |

---

## Fuentes de verdad (orden de prioridad)

1. **Código con tests** — lo que no puede romperse sin que falle CI:
   - `src/lib/domain/brand-positioning.ts` — copy, voz, frases prohibidas, tokens visuales
   - `src/lib/domain/seo.ts` — meta por página, sitemap, robots, JSON-LD
   - `test/domain/brand-positioning.test.ts`, `test/domain/seo.test.ts`
2. **Documentos de marca** — este directorio + editorial + plantillas
3. **Content library** — `docs/content-library/` (borradores listos para diseño)
4. **SDD** — `openspec/specs/brand-positioning/spec.md`, change `openspec/changes/brand-positioning-v1/`

Si código y doc discrepan, **gana el código** hasta que alguien actualice ambos a propósito.

---

## Línea roja (no negociable)

- Migajas es **educativa**, no clínica ni dispositivo médico.
- Comida real primero; diabetes solo como contexto en caption, no en titular.
- Sin hype SaaS, sin control de diabetes, sin insulina en marketing.
- Territorio **ES o RD por pieza**, nunca mezclado en la misma publicación.

---

## Historial de formalización

| Fecha | Hito |
|-------|------|
| 2026-07-24 | Borrador estratégico ChatGPT (Brand Editorial System v0.1) |
| 2026-07-24 | Formalización SDD + `brand-positioning.ts` + content library |
| 2026-07-24 | Plantillas visuales v0.1 (spec Canva; producción vía HTML) |
| 2026-07-24 | Unificación copy canónico (tagline + one-liner) |
| 2026-07-25 | SEO técnico: robots, sitemap, meta, JSON-LD, noindex |
| 2026-07-26 | Hub de documentación de marca (este directorio) |

---

## Mantenimiento

Al cambiar copy de marketing o una regla editorial:

1. Actualizar `brand-positioning.ts` y/o `seo.ts`
2. Actualizar tests
3. Actualizar [DECISIONS.md](./DECISIONS.md) con la decisión y fecha
4. Si afecta a Instagram, actualizar editorial o content library
