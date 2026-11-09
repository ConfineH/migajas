# Batch 01 — Producción P03–P09 (fin de semana)

Adaptado del flujo **Meant To** (`meant_to_mvp/scripts/social-batch-01/`): slides en datos → HTML → PNG con Playwright.  
**P01 y P02** ya los tienes (ChatGPT); este doc cubre **P03 en adelante**.

**Copy canónico:** `batch-01-instagram.md`  
**Plantillas visuales:** `docs/BRAND_CANVA_TEMPLATES_v0.1.md`  
**Prompts:** [prompts.md](./prompts.md) · [prompts-chatgpt-images.md](./prompts-chatgpt-images.md)  
**Contexto agente:** `.agents/product-marketing.md`

---

## Resumen del día

| Bloque | Qué | Tiempo |
|--------|-----|--------|
| Setup | `npm install` + Chromium Playwright | 10 min |
| Export texto | `npm run export:social-batch-p03-p09` → 15 PNG | 5 min |
| Fotos P04/P07 slide 1 | ChatGPT (opcional, sustituir Unsplash) | 30 min |
| Screenshot P06 | Captura app práctica | 15 min |
| Re-export P06 si hace falta | 2 min |
| Revisión grid + captions | 20 min |

**Total:** ~1–2 h (sin regenerar fotos con IA).

---

## Paso 1 — Setup (una vez)

```bash
cd C:\Users\Tony\migajas
npm install
npx playwright install chromium
```

---

## Paso 2 — Export automático (slides con texto)

```bash
npm run export:social-batch-p03-p09
```

**Salida:** `public/social/batch-01/`

| Archivo | Post |
|---------|------|
| `03-confidence.png` | P03 |
| `04-slide-01` … `04-slide-04` | P04 |
| `05-question.png` | P05 |
| `06-product.png` | P06 (placeholder si no hay screenshot) |
| `07-slide-01` … `07-slide-04` | P07 |
| `08-slide-01` … `08-slide-03` | P08 |
| `09-confidence.png` | P09 |

**Preview local:** abre `public/social/batch-01/index-p03-p09.html`  
**Captions:** `public/social/batch-01/captions-p03-p09.md`

---

## Paso 3 — Qué NO exporta el script (igual que Meant To)

| Tipo | Herramienta |
|------|-------------|
| Slides solo texto | ✅ Script (Playfair + DM Sans, pixel-perfect) |
| Foto slide 1 La Porción | ChatGPT imagen **o** Unsplash del script (sustituir) |
| Screenshot app P06 | Captura real → `public/screenshots/practice-exercise.png` |

**No uses ChatGPT para slides de texto** — en Migajas ya vimos typos y fuentes raras. Meant To usa Canva/HTML; aquí usamos el export.

---

## Paso 4 — Screenshot Post 06

1. Abre la app (local o producción).
2. Pantalla de **ejercicio / práctica** (sin datos personales).
3. Guarda como `public/screenshots/practice-exercise.png`.
4. Vuelve a ejecutar `npm run export:social-batch-p03-p09`.

---

## Paso 5 — Fotos editoriales (opcional, mejora P04 y P07)

Pega **una vez** en ChatGPT (generación de imágenes):

```
Actúa como fotógrafo editorial para Migajas (educación alimentaria, diabetes).

Estilo: revista gastronómía tranquila, luz natural, crema/madera/cerámica.
Formato 1:1. Sin texto, logos ni personas mirando a cámara.

Confirma y espera mis escenas una por una.
```

### Foto A — P04 slide 1 (arroz)

```
Plato de arroz blanco cocido en bol de cerámica, guarnición verde discreta al lado.
Encimera madera, luz mañana suave. Square 1:1. Sin texto.
```

Sustituye `04-slide-01-cover.png` manualmente o cambia URL en `scripts/social-batch-01/photos.mjs` y re-exporta.

### Foto B — P07 slide 1 (mangú)

```
Mangú dominicano en plato, huevo frito y aceite visible, mesa madera, luz natural.
Comida caribeña real, editorial. Square 1:1. Sin texto.
```

---

## Paso 6 — Orden de publicación

| Semana | Martes | Jueves | Sábado |
|--------|--------|--------|--------|
| S1 | P01 ✅ | P02 ✅ | **P03** |
| S2 | **P04** | **P05** | **P06** |
| S3 | **P07** | **P08** | **P09** |

Horario sugerido: 10:00 o 19:00 (fijo).

---

## Checklist por post

- [ ] PNG 1080×1080 en orden
- [ ] Badge 🇪🇸 solo ES · 🇩🇴 solo RD · neutros sin badge
- [ ] `migajas` solo en última slide de carruseles
- [ ] Caption + disclaimer de `captions-p03-p09.md`
- [ ] P04/P07: misma lógica narrativa que P01 (pregunta → lista → revelación → cierre)

---

## Si cambias copy

1. Edita `scripts/social-batch-01/slides.mjs`
2. `npm run export:social-batch-p03-p09`

Fuente de verdad del texto: `docs/content-library/batch-01-instagram.md` (mantener sincronizado).

---

## Comparación con Meant To

| Meant To | Migajas |
|----------|---------|
| Fraunces + crema `#faf6f0` | Playfair + DM Sans + crema `#F9F7F1` |
| Footer logo + "Meant To·" | Wordmark `migajas` abajo derecha |
| Clues / Together / Reflection | La Porción / Confianza / Mito / Producto |
| `pnpm export:social-batch-01` | `npm run export:social-batch-p03-p09` |
| 27 slides batch completo | 15 slides (P03–P09) |

---

## P02 caption (actualizado — grasas/proteínas)

Usa este caption al publicar P02 (no el del batch antiguo):

```
La etiqueta no es un examen. Es una pista.

Tiene varias líneas: grasas, proteínas, hidratos de carbono… Para contar raciones, empezamos por una: carbohidratos por 100 g. El resto también importa — lo vemos en su momento.

Contenido educativo. No sustituye el consejo de profesionales sanitarios.
```
