# Registro de decisiones — Marca y marketing Migajas

Formato: decisión → contexto → estado → desviaciones conocidas.

---

## D-001 — Arco de marca: Entender → Practicar → Confiar

**Fecha:** 2026-07-24  
**Contexto:** Borrador ChatGPT ofrecía tres arcos. Opción B (*Observar → Descubrir → Elegir*) era más filosófica; C más emocional/campaña.  
**Decisión:** **A — Entender → Practicar → Confiar.** Migajas vende claridad, no motivación vacía.  
**Estado:** Cerrada. En código: `PRODUCT_ARC` en `brand-positioning.ts`.  
**Desviación:** Ninguna.

---

## D-002 — Idea fundacional y outcome editorial

**Decisión:** Migajas comunica una **forma de aprender**; la app es el lugar del aprendizaje. Outcome por pieza: *"Ahora lo entiendo mejor."*  
**Estado:** Cerrada. `BRAND_FOUNDATION`, `BRAND_OUTCOME`.  
**Desviación:** Ninguna.

---

## D-003 — Voz y rostro de marca

**Decisión:**
- Voz **plural editorial** o impersonal (*"Empecemos por una sola idea"*).
- **Marca sin rostro** en v1 (sin fundador como autoridad clínica).
- Categoría Instagram / cuenta profesional: **Educación**.

**Estado:** Cerrada. `BRAND_VOICE`, `SOCIAL_COPY.category`.  
**Desviación:** Ninguna.

---

## D-004 — Territorio en contenido

**Decisión:** Cada pieza con comida o cifras es **ES o RD**, nunca mezclada. Lanzamiento social prioriza **España**; RD en piezas etiquetadas 🇩🇴.  
**Estado:** Cerrada. `TERRITORY_RULE`.  
**Desviación:** Ninguna.

---

## D-005 — Relación feed Instagram ↔ curso app

**Decisión:** Contenido **autónomo pero resonante**: no requiere la app; temas hacen eco del currículo sin seguir orden de niveles.  
**Estado:** Cerrada. `FEED_COURSE_RELATION`.  
**Desviación:** Ninguna.

---

## D-006 — Mix editorial Instagram

**Decisión:** 60% educación · 20% marca · 10% comunidad · **10% producto** (≈1 pieza de producto cada 3 semanas, no 15%).  
**Estado:** Cerrada. `CONTENT_MIX`.  
**Desviación:** El borrador ChatGPT inicial decía 15% para serie "Dentro de Migajas". **Corregido** a 10% global; tiene sentido para no parecer app-first.

---

## D-007 — Jerarquía de copy (app + SEO)

**Fecha:** 2026-07-24  
**Decisión:**

| Rol | Texto |
|-----|-------|
| Tagline | Aprende contando carbohidratos. |
| One-liner | Aprende a contar carbohidratos con comida real de tu país — paso a paso, con tranquilidad. |
| Hero subtítulo | Un curso guiado con comida real de tu país. Paso a paso, con tranquilidad. |
| Onboarding | Bienvenido a Migajas + one-liner |

**Estado:** Cerrada. Constantes en `brand-positioning.ts`; cableado en home, layout, onboarding, OG.  
**Desviación anterior (corregida):** Home decía *"Bienvenido… Tu guía amable…"*; onboarding y meta usaban textos distintos. **Unificación intencional** — tagline más directa y alineada con OG y marca editorial.

---

## D-008 — Sistema editorial antes que posts sueltos

**Decisión:** No generar campañas ni posts masivos sin **plantillas + biblioteca + brief**. Patrón validado en proyecto Meant To.  
**Estado:** Cerrada. Docs: `BRAND_EDITORIAL_SYSTEM.md`, `content-library/`, `BRAND_CANVA_TEMPLATES_v0.1.md`.  
**Desviación:** Ninguna.

---

## D-009 — Herramienta de producción visual

**Decisión:** Spec de plantillas en `BRAND_CANVA_TEMPLATES_v0.1.md` (nombre histórico). **Producción acordada:** HTML + fuentes Google (ChatGPT), no imágenes con texto generado por IA. Fotos solo como assets sin texto.  
**Estado:** Cerrada para v0.1. Ver [CREATIVE-PRODUCTION.md](./CREATIVE-PRODUCTION.md).  
**Desviación:** Nombre del archivo dice "Canva" pero el flujo real es HTML. **Tiene sentido** mantener el nombre del spec (formato 1080×1080); renombrar es opcional y baja prioridad.

---

## D-010 — Guardrails en código (TDD)

**Decisión:** Copy de marketing y frases prohibidas validados con Vitest (`findForbiddenMarketingPhrases`). Superficies activas importan constantes, no strings sueltos.  
**Estado:** Cerrada.  
**Desviación:** Onboarding clínico menciona "dispositivo médico" en copy legal — **excluido** del escaneo de marketing (`MARKETING_BRAND_SOURCES` vs rutas legales). Correcto.

---

## D-011 — SEO técnico público vs privado

**Fecha:** 2026-07-25  
**Decisión:**
- **Indexar:** `/`, `/onboarding`, `/learn`, `/learn/nivel-*`, `/guia`, legal.
- **No indexar:** admin, api, auth, login, diario, analytics, progress, inicio, catalog, levels.
- JSON-LD `Organization` + `Course` en home.
- Search Console: enviar `sitemap.xml` tras verificar propiedad.

**Estado:** Implementado en `seo.ts`, `robots.ts`, `sitemap.ts`.  
**Desviaciones / matices:**
- `/guia` está en sitemap pero **redirige** sin onboarding completado → aceptable como URL de descubrimiento; el usuario cae en onboarding.
- `/catalog` y `/levels` **no** están en sitemap (requieren modo libre) → **intencional**.

---

## D-012 — Audiencia B2B vs B2C en canales

**Decisión:** Instagram y copy público = **B2C / educación**. Mensaje B2B (licencia territorial, clínicas) vive en `docs/commercial/`, no en feed Instagram v0.1. El contenido debe ser **recomendable por educadores** sin sonar a brochure.  
**Estado:** Cerrada estratégicamente; sin canal LinkedIn B2B aún.  
**Desviación:** Ninguna.

---

## D-013 — Mención de diabetes en titulares

**Decisión:** Titulares = comida y aprendizaje. "Diabetes" solo en caption/contexto educativo moderado, nunca como promesa de control.  
**Estado:** Cerrada en editorial; reforzada por `FORBIDDEN_MARKETING_PATTERNS`.  
**Desviación:** Ninguna.

---

## Pendientes (no son desviaciones, son siguientes pasos)

| ID | Tema | Notas |
|----|------|-------|
| P-01 | Cuenta Instagram creada y batch-01 publicado | Depende de plantillas HTML + fotos |
| P-02 | Dominio propio + Search Console verificado | Hoy `migajas.vercel.app` |
| P-03 | `docs/brand/CREATIVE-PRODUCTION.md` → guardar HTML Post-01 en repo | Opcional: `docs/social/post-01/` |
| P-04 | Serie "En la mesa" (comer fuera) | Propuesta; no en v0.1 |
| P-05 | Renombrar `BRAND_CANVA_TEMPLATES` → `BRAND_VISUAL_TEMPLATES` | Cosmético |

---

## Cómo añadir una decisión

```markdown
## D-0XX — Título corto
**Fecha:** YYYY-MM-DD
**Contexto:** …
**Decisión:** …
**Estado:** Cerrada | Pendiente | Supersedida por D-0YY
**Desviación:** …
```
