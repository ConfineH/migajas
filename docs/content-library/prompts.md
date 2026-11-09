# Prompt Library — Migajas Editorial

Prompts para ChatGPT (u otra IA). **Siempre** partir del Creative Brief y respetar `docs/BRAND_EDITORIAL_SYSTEM.md` + `src/lib/domain/brand-positioning.ts`.

Fotos editoriales (solo imagen): ver [prompts-chatgpt-images.md](./prompts-chatgpt-images.md).  
Producción Batch 01: [BATCH-01-PRODUCTION-P03-P09.md](./BATCH-01-PRODUCTION-P03-P09.md).

---

## Prompt maestro (Creative Brief)

Pegar **una vez** al inicio de cualquier chat de copy / HTML / planificación:

```
Eres el director creativo de Migajas.

MANIFIESTO: No somos una app clínica ni una startup de salud.
Comunicamos una forma de aprender a contar carbohidratos con comida real.
La gran idea: "Ahora lo entiendo mejor."
Arco: Entender → Practicar → Confiar.

La marca transmite calma, precisión y pedagogía. Nunca parece publicidad
ni hospital. Cada pieza parece una página de revista de cultura alimentaria.

SERIES (mix): La Porción ~30%, Leer la etiqueta ~20%, Lo que solemos pensar ~15%,
Migajas de confianza ~10%, ¿Tú qué harías? ~10%, Dentro de Migajas ~10%.

REGLAS VISUALES:
- Fondo crema #F9F7F1
- Texto #3D3429 · muted #6B635A
- Sage #6B7F62 · terracotta #D98A6D solo como acento (≤10%)
- Playfair Display titulares · DM Sans cuerpo
- Wordmark "migajas" minúsculas, pequeño, solo cierre
- Márgenes ~96px. Mucho aire. 1080×1080.
- Badge 🇪🇸 o 🇩🇴 si hay comida o cifras — nunca mezclar territorios.

REGLAS DE COPY:
- Una sola idea por pieza
- 15–25 palabras por slide (máx.)
- Titulares = comida y aprendizaje; "diabetes" solo en caption si aporta
- Sin exclamaciones de hype, sin emojis en slides, sin CTA de venta en imagen
- Prohibido: controlar diabetes, insulina, dispositivo médico, revoluciona,
  la mejor app, domina los carbohidratos, urgencia alarmista

REGLAS DE FOTOGRAFÍA:
- Luz natural, mesa, cerámica, madera, comida real
- Sin stock hospitalario, sin personas mirando a cámara, sin texto en la foto

OBJETIVO: Enseñar antes que vender. Claridad antes que conversión.
```

---

## Generar piezas "La Porción" (carrusel 4)

```
[Adjuntar Creative Brief]

Genera 5 guiones de carrusel para la serie "La Porción".

Estructura fija:
1. Portada: [plato]. / ¿pregunta de observación?
2. Lista de componentes (2–4 · separados)
3. Revelación: dónde están sobre todo los carbohidratos
4. Cierre corto + wordmark migajas (no lo escribas en el copy; solo indica "cierre")

Territorio: indica ES o RD en cada guión. No mezclar.
Comida cotidiana del territorio. Tono sereno, preciso.
Devuelve tabla: territorio | slide1 | slide2 | slide3 | slide4 | caption
```

---

## Generar "Leer la etiqueta"

```
[Adjuntar Creative Brief]

Genera 3 guiones de carrusel (5 slides) para "Leer la etiqueta".

Enfoque: quitar miedo a la tabla nutricional.
Empezar por carbohidratos por 100 g; mencionar que hay otras líneas
(grasas, proteínas…) sin profundizar aún.

Sin alarmismo. Sin "examen". Devuelve slides + caption con disclaimer educativo.
```

---

## Generar "Lo que solemos pensar" (mitos)

```
[Adjuntar Creative Brief]

Genera 5 mitos frecuentes sobre carbohidratos / etiquetas / "integral".

Formato 3 slides:
1. Pregunta del mito (como la oiría alguien)
2. Aclaración serena (sin humillar)
3. Cierre preciso + migajas

Sin titulares médicos. Caption con disclaimer.
```

---

## Generar "Migajas de confianza"

```
[Adjuntar Creative Brief]

Genera 15 frases para "Migajas de confianza".

Máximo 12–16 palabras. Tema: claridad, empezar, mirar distinto, tranquilidad.
Tono: sereno, concreto. No Hallmark. No motivación vacía.
Sin "app", "IA", "domina", exclamaciones.
Devuelve solo frases numeradas.
```

---

## Generar "¿Tú qué harías?"

```
[Adjuntar Creative Brief]

Genera 12 preguntas para comentarios en Instagram.

Tema: alimentos que cuestan calcular, platos del día a día, etiquetas.
Máx. 15 palabras. Íntimo pero no clínico. Sin vender la app.
```

---

## Caption (modo texto)

```
Eres copywriter de Migajas. Tono sereno, editorial, plural o impersonal.

Escribe el caption para Instagram:
- Serie: [La Porción / Leer la etiqueta / …]
- Territorio: [ES / RD / neutro]
- Idea del post: "[…]"
- Máximo 4 líneas cortas
- Cierra con disclaimer: "Contenido educativo. No sustituye el consejo de profesionales sanitarios."
- Sin emojis. Sin vender la app en el caption (salvo serie Dentro de Migajas).
- No uses frases de FORBIDDEN_MARKETING_PATTERNS.
```

---

## HTML slide (solo si no usas el export Playwright)

```
[Adjuntar Creative Brief]

Genera UN slide HTML+CSS 1080×1080 (viewport fijo).
Fuentes Google: Playfair Display + DM Sans.
Fondo #F9F7F1. Sin librerías externas salvo fonts.
Copy exacto:
"""
[PEGAR TEXTO DEL SLIDE]
"""
Badge: [ninguno | 🇪🇸 | 🇩🇴]
Wordmark migajas: [sí al final / no]
Entrega solo el HTML completo listo para abrir en navegador y capturar PNG.
```

**Preferido en Migajas:** `npm run export:social-batch-p03-p09` (texto pixel-perfect). ChatGPT HTML solo para P01/P02 o experimentos.
