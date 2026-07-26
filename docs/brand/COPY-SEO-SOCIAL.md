# Copy, SEO y redes — Referencia canónica

**Fuente de verdad en código:** `src/lib/domain/brand-positioning.ts`, `src/lib/domain/seo.ts`.

Este documento es legible para humanos; si hay conflicto, prevalece el código (validado por tests).

---

## Jerarquía de copy

| Constante | Texto | Dónde se usa |
|-----------|-------|--------------|
| `BRAND_TAGLINE` | Aprende contando carbohidratos. | Hero h1, OG headline |
| `BRAND_ONE_LINER` | Aprende a contar carbohidratos con comida real de tu país — paso a paso, con tranquilidad. | Meta description, onboarding intro |
| `HERO_COPY.subtitle` | Un curso guiado con comida real de tu país. Paso a paso, con tranquilidad. | Home |
| `HERO_COPY.ctaPrimary` | Empezar mi curso | Botón home |
| `HERO_COPY.ctaSecondary` | Ya empecé — continuar | Enlace home |
| `ONBOARDING_COPY.welcomeTitle` | Bienvenido a Migajas | Paso 1 onboarding |
| `ONBOARDING_COPY.educationalNote` | Migajas es una herramienta educativa. No sustituye el criterio de tu equipo de salud. | Onboarding |
| `SEO_COPY.title` | Migajas — Aprende contando carbohidratos | `<title>` default |
| `SEO_COPY.openGraphDescription` | Un curso guiado para relacionar gramos, carbohidratos y raciones con comida real de tu país. | OG (layout + imagen) |
| `SOCIAL_COPY.bio` | Aprende a contar carbohidratos con comida real.\nCurso guiado paso a paso. | Instagram bio |
| `SOCIAL_COPY.category` | Educación | Cuenta profesional IG |

---

## Outcome y fundación (editorial)

- **Fundación:** Migajas comunica una forma de aprender. La app es el lugar donde ese aprendizaje ocurre.
- **Outcome por pieza:** "Ahora lo entiendo mejor."

---

## Frases prohibidas (marketing)

Validadas por `findForbiddenMarketingPhrases()`. Incluyen entre otras:

- Controla tu diabetes
- Calcular / ajustar insulina
- Dispositivo médico / sanitario (en **marketing**; sí en copy legal)
- Revoluciona, la mejor app, solución definitiva
- Domina los carbohidratos
- Urgencia: antes de que sea tarde

Sustitutos orientativos en `BRAND_EDITORIAL_SYSTEM.md` §6.

---

## SEO por página (públicas)

Definidas en `PUBLIC_PAGE_SEO` y `getLearnLevelSeo()`.

| Ruta | Title (resumen) |
|------|-----------------|
| `/` | Migajas — Aprende contando carbohidratos |
| `/onboarding` | Empezar el curso — Migajas |
| `/learn` | Curso guiado de conteo de carbohidratos — Migajas |
| `/learn/nivel-N` | Nombre del nivel — Migajas |
| `/guia` | Guía de referencia — Migajas |
| `/privacidad`, `/terminos`, `/cookies` | Legal |

Cada entrada incluye `description` única (ver `seo.ts`).

---

## No indexar (robots + meta)

Prefijos en `ROBOTS_DISALLOW_PREFIXES`: `/admin`, `/api`, `/auth`, `/login`, `/diario`, `/analytics`, `/progress`, `/inicio`, `/catalog`, `/levels`.

Layouts con `NOINDEX_METADATA`: admin, login, auth; páginas privadas individuales.

---

## JSON-LD (home)

- `Organization` — nombre, url, descripción
- `Course` — curso de conteo de HC, gratis, url `/learn`

Builders: `buildOrganizationJsonLd`, `buildCourseJsonLd`.

---

## Disclaimers redes

| Uso | Texto |
|-----|-------|
| Corto (caption) | Contenido educativo. No sustituye el consejo de profesionales sanitarios. |
| Largo | Migajas es una herramienta educativa para aprender a contar carbohidratos. No ofrece recomendaciones médicas ni de tratamiento. |
| Respuesta dudas médicas | Ver `MEDICAL_QUESTION_RESPONSE` en código |

---

## Superficies cableadas a código

| Archivo | Constantes |
|---------|------------|
| `src/app/page.tsx` | `PUBLIC_PAGE_SEO.home`, JSON-LD |
| `src/app/layout.tsx` | `buildRootMetadata()` |
| `src/components/home/HomeAnimated.tsx` | `HERO_COPY` |
| `src/components/OnboardingFlow.tsx` | `ONBOARDING_COPY` |
| `src/app/opengraph-image.tsx` | `BRAND_TAGLINE`, `SEO_COPY` |
| Páginas públicas | `buildPageMetadata(PUBLIC_PAGE_SEO.*)` |

---

## Cambiar copy de forma segura

1. Editar constante en `brand-positioning.ts` o entrada en `seo.ts`
2. `npm test -- test/domain/brand-positioning.test.ts test/domain/seo.test.ts`
3. Actualizar este doc si cambia la tabla de arriba
4. Añadir entrada en `DECISIONS.md`
