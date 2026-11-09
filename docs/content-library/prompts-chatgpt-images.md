# Prompts ChatGPT — Imágenes (Batch 01 Migajas)

Misma regla que Meant To: **ChatGPT = solo fotos**. Texto = export Playwright / HTML plantilla.

---

## Qué pedirle y qué no

| Tipo | ChatGPT imagen | Herramienta |
|------|----------------|-------------|
| Foto editorial (cover La Porción) | ✅ | Este doc |
| Slides con texto | ❌ | `npm run export:social-batch-p03-p09` |
| Screenshot producto (P06) | ❌ | Captura real → `public/screenshots/practice-exercise.png` |

ChatGPT **falla con texto en español** en imágenes. No generes slides completos como imagen.

---

## Paso 0 — Sistema (1 vez, chat nuevo)

```
Actúa como fotógrafo editorial para Migajas (educación alimentaria; Instagram).

Estilo: revista gastronómica tranquila (no hospital, no fitness influencer).
Paleta: crema, madera, cerámica, sage suave. Luz natural. Baja saturación.

REGLAS OBLIGATORIAS:
- Formato cuadrado 1:1 (1080×1080)
- Sin texto, logos, marcas ni watermarks
- Sin personas mirando a cámara
- Sin quirófanos, pastillas, glucómetros ni estética clínica
- Comida real, platable, cotidiana (España o Caribe según te indique)
- Fotorrealista, no ilustración

Confirma que has entendido y espera mis prompts uno a uno.
```

---

## Paso 1 — Fotos Batch 01 (un mensaje por foto)

### Foto A · Post 01 — Tostada (ES) · cover

**Destino:** slide 1 P01 (producción manual / HTML)

```
Editorial food photograph for a calm culinary magazine.

A Spanish-style toast (pan tostado) on a ceramic plate: tomato, olive oil, thin jamón.
Wooden table, soft morning window light, cream and warm wood tones.
Shallow depth of field. Minimal, generous negative space.

Square 1:1. Photorealistic. No text. No logos. No people.
```

---

### Foto B · Post 04 — Arroz (ES) · cover

**Destino:** sustituir Unsplash en `04-slide-01-cover.png`  
(o URL en `scripts/social-batch-01/photos.mjs` → re-export)

```
Editorial food photograph for a calm culinary magazine.

A bowl of plain cooked white rice in ceramic, with a small discreet green side garnish.
Wooden countertop, soft morning light, cream palette, shallow depth of field.
Everyday Spanish home meal, not restaurant plating.

Square 1:1. Photorealistic. No text. No logos. No people.
```

---

### Foto C · Post 07 — Mangú (RD) · cover

**Destino:** sustituir Unsplash en `07-slide-01-cover.png`

```
Editorial food photograph for a calm culinary magazine.

Dominican mangú (mashed green plantain) on a simple plate, with fried egg and a little oil visible.
Wooden table, natural daylight, warm cream tones. Authentic Caribbean home cooking, not stock exotic.

Square 1:1. Photorealistic. No text. No logos. No people.
```

---

## Paso 2 — Si la foto no encaja

```
Casi. Regenera con estos ajustes:
- Más espacio vacío alrededor del plato
- Tonos más cálidos (crema/madera, no fríos)
- Menos saturación
- Sin look de stock hospitalario o fitness
- Mantén 1:1, sin texto, sin logos
```

```
Demasiado recargado. Simplifica: un plato protagonista, fondo limpio, luz suave.
```

---

## Paso 3 — Plantilla para batches futuros

```
Editorial food photograph for Migajas Instagram (calm culinary magazine).

SCENE: [plato + superficie en 1–2 frases]
TERRITORY FEEL: [Spanish home / Dominican home]
LIGHT: natural window light, soft shadows
PALETTE: warm cream, wood, ceramic, muted sage
MOOD: everyday, clear, serene — not clinical

Square 1:1. Photorealistic. Minimal negative space.
No text, no logos, no watermarks, no people looking at camera.
```

| Tema | SCENE |
|------|-------|
| Yogur + fruta | `Bowl of plain yogurt with sliced fruit and a few oats, ceramic, morning light` |
| Garbanzos | `Simple chickpea salad in a shallow bowl, olive oil sheen, wooden table` |
| Etiqueta (objeto) | `Close-up of a food package nutrition label area blurred enough to be unreadable, soft light — no legible text` |

*(Si necesitas etiqueta legible: foto real, no IA.)*

---

## Checklist foto

- [ ] 1:1, sin texto
- [ ] Comida cotidiana del territorio del post
- [ ] No parece clínica ni anuncio de dieta
- [ ] Encaja con crema/sage del grid 3×3
