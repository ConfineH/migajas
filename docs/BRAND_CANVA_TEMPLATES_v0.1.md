# MIGAJAS — Plantillas Canva v0.1

Sistema de plantillas reutilizables para Instagram (1080×1080). Cualquier persona puede duplicar una plantilla y producir una pieza nueva sin tomar decisiones de diseño.

**Relacionado:** `docs/BRAND_EDITORIAL_SYSTEM.md`, `docs/content-library/batch-01-instagram.md`, `src/lib/domain/brand-positioning.ts`

La consistencia nace de repetir siempre la misma estructura, no de reinventar cada publicación.

---

## Página 0 — Sistema editorial compartido

### Canvas

| Propiedad | Valor |
|-----------|-------|
| Tamaño | 1080 × 1080 px |
| Márgenes exteriores | 96 px (mínimo 80 px) |
| Zona segura | 888 × 888 px centrada |

### Grid

- Retícula de **12 columnas**
- Gutter: 24 px
- Baseline vertical: 8 px
- Todo debe alinearse a esta retícula

### Espaciado

| Token | Valor |
|-------|-------|
| XS | 16 px |
| S | 24 px |
| M | 40 px |
| L | 64 px |
| XL | 96 px |

Nunca pegar elementos. Siempre sobra aire.

### Colores

| Token | Hex | Uso |
|-------|-----|-----|
| Crema (fondo) | `#F9F7F1` | ~70% de publicaciones |
| Sage principal | `#6B7F62` | Titulares, números, palabras importantes |
| Sage claro | `#B8C9AF` | Cajas, fondos secundarios, etiquetas suaves |
| Terracotta | `#D98A6D` | ≤10% — numeración, bullets, badge, subrayados |
| Texto principal | `#3D3429` | Cuerpo |
| Texto secundario | `#6B635A` | Microtexto, pies |

Terracotta nunca como color dominante.

### Tipografía

| Rol | Fuente | Tamaño | Notas |
|-----|--------|--------|-------|
| Titular | Playfair Display Regular/Medium | 40–68 pt | Jamás Bold. Máx. 2 líneas |
| Texto | DM Sans Regular | 24–34 pt | |
| Microtexto | DM Sans Medium | 18–20 pt | |
| Wordmark | DM Sans Medium | 18–22 pt | `migajas` en sage |

### Logo

- Wordmark: **migajas** (minúsculas)
- Ubicación: esquina inferior derecha o última slide
- Nunca protagonista

### Badge territorial

- Ubicación: esquina superior derecha (20–24 px)
- **🇪🇸** o **🇩🇴** — nunca ambos en la misma pieza

### Fotografía

**Sí:** luz natural, mesa, lino, madera, cerámica, ingredientes reales.

**No:** personas sonriendo a cámara, hospitales, glucómetros, jeringas, fondos blancos clínicos.

**Estilo:** revista tranquila, no carrusel de marketing.

---

## Plantilla 01 — La Porción (estrella)

**Objetivo:** Explicar visualmente dónde están los carbohidratos de un alimento real.

**Secuencia narrativa:** Ver → Observar → Entender → Recordar

**Layout:** 4 slides. Mismos márgenes (96 px) en todas.

### Slide 1

- 70% fotografía / 30% texto
- Foto parte superior, texto abajo

```
[FOTO]

Una tostada.

¿Dónde están
realmente los
carbohidratos?
```

### Slide 2

- Fondo crema, sin fotografía
- Lista vertical, gran aire
- Cada ingrediente con punto terracotta

```
Pan
Tomate
Aceite
Jamón
```

### Slide 3

- Fondo sage claro, caja central
- Una frase, mucho aire
- Palabra clave (ej. "pan") en sage

```
Los carbohidratos

están sobre todo

en el pan.
```

### Slide 4

- Fondo crema, sin foto
- Frase final + logo
- Palabra "ayuda" en terracotta

```
Empezar por
una capa
ayuda.

                  migajas
```

### Jerarquía tipográfica

| Elemento | Fuente | Tamaño |
|----------|--------|--------|
| Título | Playfair | 60 pt |
| Pregunta | Playfair | 46 pt |
| Lista | DM Sans | 34 pt |
| Conclusión | Playfair | 54 pt |
| Logo | DM Sans | 20 pt |

### Uso del color por slide

| Slide | Fondo | Acentos |
|-------|-------|---------|
| 1 | Crema | Texto sage |
| 2 | Crema | Bullets terracotta, texto marrón |
| 3 | Sage claro | Texto marrón, palabra clave sage |
| 4 | Crema | "ayuda" terracotta |

### Zonas fijas

- Foto: superior
- Badge: superior derecha
- Logo: inferior derecha
- Texto: alineado izquierda

### Do / Don't

| Do | Don't |
|----|-------|
| Mucho aire | Añadir cifras |
| Una sola idea | Añadir CTA |
| Foto sencilla | Poner iconos |

### Variantes

- Foto cenital
- Sin fotografía (ilustración ingrediente)
- Badge 🇪🇸 / 🇩🇴

---

## Plantilla 02 — Leer la etiqueta

**Objetivo:** Enseñar un único paso para interpretar etiquetas sin saturar.

**Layout:** 5 slides con estructura repetida.

1. Portada (título + foto parcial del producto)
2. Concepto clave (caja sage claro)
3. Acción (número destacado en terracotta)
4. Error frecuente (fondo crema, bloque con borde sage)
5. Resumen (frase editorial + logo)

### Jerarquía

| Elemento | Fuente | Tamaño |
|----------|--------|--------|
| Título | Playfair | 56 pt |
| Subtítulo | DM Sans | 30 pt |
| Texto | DM Sans | 28 pt |
| Número / palabra clave | Playfair | 72 pt |

### Color

- Fondo crema en 4 de 5 slides
- Slide 3: caja sage claro
- Terracotta solo para número o palabra "Error"

### Zonas fijas

- Foto de producto: tercio superior en slides 1 y 2
- Texto: alineado izquierda
- Logo: solo slide 5

### Do / Don't

| Do | Don't |
|----|-------|
| Una sola parte de la etiqueta | Flechas |
| Resaltar el dato relevante | Marcar muchos elementos |
| Mismo encuadre fotográfico | Infografía técnica densa |

### Mockup

1. Leer la etiqueta
2. Busca "carbohidratos" por 100 g
3. Multiplica por la porción que vas a comer
4. Error frecuente: confundir peso neto con porción
5. Un dato claro vale más que adivinar. + migajas

### Variantes

- Foto completa del envase
- Recorte de tabla nutricional
- Badge 🇪🇸 / 🇩🇴

---

## Plantilla 03 — Migajas de confianza

**Objetivo:** Transmitir una idea memorable sin enseñar ni vender.

**Layout:** Una única caja de texto centrada verticalmente. Nada más.

### Tipografía

- Playfair 68–72 pt
- Interlineado 1.5

### Color

- Fondo crema
- Texto marrón
- Una palabra en sage

### Zonas

- Logo muy pequeño abajo derecha

### Do / Don't

| Do | Don't |
|----|-------|
| Máx. 18 palabras | Iconos |
| 2–3 bloques de texto | Fotos |
| Mucho silencio visual | Fondos decorativos |

### Mockup

```
No hace falta

memorizar todo.

Hace falta

empezar

a mirar distinto.
```

### Variantes

- Fondo sage claro
- Línea vertical terracotta
- Badge opcional

---

## Plantilla 04 — ¿Tú qué harías?

**Objetivo:** Generar conversación sin parecer un examen.

**Layout:** Pregunta centrada con amplio espacio negativo. Pie: "Te leemos en comentarios."

### Tipografía

| Elemento | Fuente | Tamaño |
|----------|--------|--------|
| Pregunta | Playfair | 64 pt |
| Pie | DM Sans | 24 pt |

### Color

- Fondo crema
- Una palabra en terracotta

### Zonas

- Logo: abajo derecha
- Badge: arriba derecha si aplica

### Do / Don't

| Do | Don't |
|----|-------|
| Una única pregunta | Opciones A/B/C |
| Máx. 4 líneas | Encuestas visuales |
| Ritmo pausado | Emojis |

### Mockup

```
¿Qué alimento

te cuesta más

calcular?
```

### Variantes

- Fondo sage claro
- Textura de lino muy sutil
- Badge 🇪🇸 o 🇩🇴

---

## Plantilla 05 — Lo que solemos pensar

**Objetivo:** Corregir una creencia sin confrontar.

**Layout:** Carrusel 3 slides — Pregunta → Aclaración → Cierre

### Tipografía

| Elemento | Fuente | Tamaño |
|----------|--------|--------|
| Pregunta | Playfair | 56 pt |
| Explicación | DM Sans | 30 pt |
| Conclusión | Playfair | 52 pt |

### Color

| Slide | Fondo |
|-------|-------|
| 1 | Crema |
| 2 | Sage claro |
| 3 | Crema |

Terracotta solo para "No siempre".

### Zonas

- Logo solo en slide 3

### Do / Don't

| Do | Don't |
|----|-------|
| Hablar con calma | "Mito/Falso" en grande |
| Corregir una sola idea | Tono burlón |
| Evitar absolutismos | Comparaciones agresivas |

### Mockup

1. ¿Si algo es integral, tiene menos carbohidratos?
2. Integral no siempre significa menos carbohidratos.
3. Significa otro tipo de harina. + migajas

### Variantes

- Con foto de pan integral
- Solo texto
- Badge territorial

---

## Plantilla 06 — Dentro de Migajas

**Objetivo:** Mostrar el producto como consecuencia del aprendizaje, no como protagonista.

**Layout**

- Fondo crema
- Mockup móvil centrado (~40% altura)
- Mucho aire alrededor
- Frase encima del dispositivo

### Tipografía

| Elemento | Fuente | Tamaño |
|----------|--------|--------|
| Frase | Playfair | 52 pt |
| Logo | DM Sans | 20 pt |

### Color

- Fondo crema
- Móvil: sombra muy suave (10–15% opacidad)
- Texto en sage

### Zonas

- Mockup: esquinas 36 px
- Logo: inferior derecho
- Sin elementos adicionales

### Do / Don't

| Do | Don't |
|----|-------|
| Una sola pantalla | Flechas |
| Móvil pequeño vs lienzo | Llamadas numeradas |
| Capturas limpias | Listas de funciones |

### Mockup

```
Así practicamos

antes de pasar

al siguiente nivel.
```

(Captura centrada de la app con amplio margen.)

### Variantes

- Móvil frontal
- Móvil ligeramente inclinado (≤5°)
- Badge 🇪🇸 o 🇩🇴 si la pantalla muestra alimentos locales

---

## Checklist antes de exportar PNG

- [ ] ¿La pieza comunica una sola idea?
- [ ] ¿Se respetan los márgenes de 96 px?
- [ ] ¿Hay suficiente espacio negativo o aún puede simplificarse?
- [ ] ¿Playfair solo en titulares y DM Sans en cuerpo?
- [ ] ¿Fondo crema o sage claro, sin colores nuevos?
- [ ] ¿Terracotta ocupa menos del 10%?
- [ ] ¿Fotografía con comida real, luz natural, sin elementos clínicos?
- [ ] ¿Wordmark `migajas` discreto, nunca protagonista?
- [ ] ¿Badge territorial único (🇪🇸 o 🇩🇴) cuando corresponde?
- [ ] ¿Transmite Entender → Practicar → Confiar y podría vivir en una revista pedagógica sin mencionar la app?
