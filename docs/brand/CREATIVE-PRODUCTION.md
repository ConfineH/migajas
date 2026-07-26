# Producción creativa — Instagram y assets

Flujo acordado para no caer en "IA que genera posts genéricos".

---

## Orden correcto

```
Estrategia (STRATEGY.md)
    → Sistema editorial (BRAND_EDITORIAL_SYSTEM.md)
    → Plantillas visuales (BRAND_CANVA_TEMPLATES_v0.1.md)
    → Biblioteca (content-library/)
    → Producción (HTML / foto)
    → Revisión humana
    → Publicar
```

**No saltar a publicar sin plantillas.**

---

## Herramienta de producción (v0.1)

| Qué | Herramienta | Notas |
|-----|-------------|-------|
| Layout + texto en slides | **HTML + CSS** (ChatGPT), 1080×1080 | Playfair + DM Sans vía Google Fonts |
| Fotografía comida | Generación IA **solo imagen**, sin texto | Insertar en bloque `.photo` |
| Export PNG | Navegador o html2canvas | Un PNG por slide |
| Canva | Opcional | Misma spec visual si se prefiere UI |

**No usar** generación de imagen con texto en español para slides completos (sale mal).

---

## Creative Brief (pegar en ChatGPT)

```
Eres el director creativo de Migajas.
Marca educativa, serena, precisa. Revista de cultura alimentaria, no startup ni clínica.
Paleta: crema #F9F7F1, sage #6B7F62, terracotta #D98A6D solo como acento (≤10%).
Tipografía: Playfair titulares, DM Sans cuerpo.
Una idea por pieza. 15-25 palabras por slide. Márgenes 96px. Mucho aire.
Comida real primero. Sin stock hospitalario.
Territorio: [ES o RD] — no mezclar cifras ni alimentos.
Serie: [La Porción / …]
Entrega: HTML 1080×1080 por slide, no imagen con texto.
Objetivo: "Ahora lo entiendo mejor."
```

---

## Post 01 — La Porción (referencia)

Copy validado (🇪🇸):

1. Una tostada. / ¿Dónde están realmente los carbohidratos?
2. Pan · Tomate · Aceite · Jamón
3. Los carbohidratos están sobre todo en el pan.
4. Empezar por una capa ayuda. + migajas

Brief foto slide 1: tostada, mesa madera, luz natural, estilo editorial, sin texto en imagen.

Calendario completo: `docs/content-library/batch-01-instagram.md`.

---

## Checklist antes de exportar

Ver checklist final en `BRAND_CANVA_TEMPLATES_v0.1.md` y tests de marca:

- Una idea por slide
- Badge 🇪🇸 o 🇩🇴 único
- Wordmark pequeño solo última slide
- Sin frases de `FORBIDDEN_MARKETING_PATTERNS`
- Disclaimer en caption si toca salud

---

## Skills instaladas (agente)

| Skill | Uso |
|-------|-----|
| `find-skills` | Descubrir skills |
| `seo` | SEO técnico web |
| `seo-audit` | Auditoría / checklist marketing |

Ruta local: `.agents/skills/`
