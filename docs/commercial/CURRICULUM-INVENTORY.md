# Inventario del material educativo — Migajas

**Documento interno / comercial / revisión pedagógica** · Generado desde `src/lib/data/` · Ago 2026 (v4 gobernanza)
**Uso:** auditoría por educadores, anexos a piloto, onboarding del buyer.

**Paquete auditor:** [AUDIT-BRIEF.md](./AUDIT-BRIEF.md) · [CATALOG-METHODOLOGY.md](./CATALOG-METHODOLOGY.md)

**Fuente de verdad:** JSON en el repo. Regenerar: `npm run docs:curriculum`.

| Artefacto | Ruta |
|-----------|------|
| Niveles + objetivos | `src/lib/data/levels.json` |
| Lecciones | `src/lib/data/lessons.json` |
| Ejercicios | `src/lib/data/exercises.json` |
| Exámenes | `src/lib/data/exams.json` |
| Alimentos y preparaciones | `src/lib/data/foods.json` |
| Umbral de aprobado | `src/lib/domain/progress.ts` (`PASS_THRESHOLD`) |
| Auditoría catálogo | `src/lib/domain/food-catalog-audit.ts` · `npm run audit:foods` |
| Fuentes | `src/lib/domain/content-sources.ts` |

---

## Resumen ejecutivo

| Bloque | Cantidad |
|--------|----------|
| Niveles | **5** |
| Lecciones | **16** |
| Ejercicios (banco) | **69** |
| Exámenes | **5** |
| Alimentos y preparaciones | **330** (179 España · 151 RD) |
| Regla ES | **10 g HC = 1 ración** |
| Regla RD | **15 g HC = 1 ración** (catálogo; curso guiado ES-first) |
| Aprobado de nivel | **≥ 70 %** de aciertos en el examen (reintentos permitidos) |

**Arco:** entender → practicar → fichas (repaso) → evaluar → confiar.
**Disclaimer:** herramienta educativa; no sustituye consejo sanitario; no calcula insulina.

---

## Metodología de construcción del catálogo

Resumen. Detalle completo: [CATALOG-METHODOLOGY.md](./CATALOG-METHODOLOGY.md).

1. Alimento simple → prioritariamente **BEDCA** (código **B**).
2. Sin equivalente BEDCA → tablas ES, **etiquetado** (**E**) o estimación documentada (**P**).
3. Plato compuesto → **receta estándar Migajas** (**R**), solo fin educativo.
4. Raciones ES: **10 g HC = 1 ración**.
5. HC **totales** por defecto (sin restar fibra automáticamente).
6. Revisión periódica; estado actual: **pendiente de firma externa** (`pending_external`).

| Código | Fuente |
|--------|--------|
| **B** | BEDCA |
| **F** | FEN |
| **E** | Etiquetado fabricante |
| **R** | Receta estándar Migajas |
| **P** | Estimación pedagógica validada |

### Criterios de porción (consistencia ES)

| Grupo | Criterio |
|-------|----------|
| Arroz / pasta | Siempre **cocidos** |
| Legumbres | Siempre **cocidas** (o hummus como preparación) |
| Frutas | **Parte comestible** habitual |
| Pan | Rebanada / trozo / unidad tipificada |
| Bebidas | Tipos diferenciados (agua, café, té, zumo, cerveza lager, cerveza sin alcohol, vino tinto seco) |

---

## Mapa del currículo

```
Nivel 1 — Fundamentos
   ↓
Nivel 2 — Cereales, tubérculos, legumbres
   ↓
Nivel 3 — Verduras y frutas
   ↓
   ├─→ Modo clínico opcional (diario + export; sin dosis ni terapia)
   ↓
Nivel 4 — Platos mixtos y cocina real
   ↓
Nivel 5 — Menús, alcohol (hipoglucemia tardía), celebraciones
```

El currículo sigue un **modelo de complejidad creciente**: conceptos → alimentos individuales → situaciones reales con varias variables. Tras aprobar el nivel 3 puede activarse el modo clínico; **no** realiza recomendaciones terapéuticas ni cálculos de dosis de insulina — solo registro y exportación opcionales.

---

## Objetivos de aprendizaje por nivel

### Nivel 1 — Fundamentos y metabolismo

Conceptos básicos: ración (10 g HC), etiquetas, moduladores, fibra y alimentos cotidianos.

**Examen:** 5 preguntas de un pool de 15. Aprobado ≥ 70 %.

Al finalizar este nivel el alumno será capaz de:

- Definir una ración de HC según la regla española (10 g = 1 ración)
- Distinguir gramos de alimento de gramos de carbohidratos
- Identificar alimentos que no aportan raciones de HC (moduladores) y su efecto en comidas mixtas
- Explicar por qué Migajas usa HC totales por defecto
- Estimar raciones de pan, fruta y lácteos habituales

| # | Lección |
|---|---------|
| 1 | Qué es una ración (10 g HC = 1 ración) |
| 2 | Gramos del alimento vs gramos de carbohidratos |
| 3 | Proteínas y grasas: no aportan raciones de HC |
| 4 | Fibra y carbohidratos: qué usa Migajas |
| 5 | Pan, fruta y lácteos: los básicos de cada día |

### Nivel 2 — Cereales, tubérculos y legumbres

Alimentos individuales densos en HC: cereales, tubérculos y legumbres.

**Examen:** 4 preguntas de un pool de 12. Aprobado ≥ 70 %.

Al finalizar este nivel el alumno será capaz de:

- Identificar los principales cereales, tubérculos y legumbres
- Estimar raciones de HC de una porción habitual (taza / plato)
- Diferenciar alimentos con y sin aporte relevante de HC en este grupo
- Usar medidas caseras (taza, plato) de forma coherente con el catálogo

| # | Lección |
|---|---------|
| 1 | Arroz y pasta: porciones en tazas y gramos |
| 2 | Patata y boniato: no son verduras, son carbohidratos |
| 3 | Legumbres: lentejas, garbanzos y alubias (con fibra y proteína) |

### Nivel 3 — Verduras y frutas avanzado

Verduras de bajo HC vs las que se contabilizan; frutas densas y zumo vs pieza.

**Examen:** 4 preguntas de un pool de 11. Aprobado ≥ 70 %.

Al finalizar este nivel el alumno será capaz de:

- Clasificar verduras de bajo HC (habitualmente no contabilizadas) frente a las que sí cuentan en la ficha
- Estimar el impacto del zumo frente a la pieza de fruta
- Reconocer frutas densas vs menos densas en HC
- Aplicar el criterio del catálogo sin asumir «cantidad libre infinita»

| # | Lección |
|---|---------|
| 1 | Verduras: bajo contenido en HC vs las que sí se contabilizan |
| 2 | Frutas avanzadas: zumo vs pieza, densidad y variedades españolas |

### Nivel 4 — Platos mixtos y cocina española

Platos compuestos y cocina real: casa, tapas y restaurante (estimaciones educativas).

**Examen:** 4 preguntas de un pool de 14. Aprobado ≥ 70 %.

Al finalizar este nivel el alumno será capaz de:

- Sumar raciones en un plato compuesto
- Estimar HC en platos típicos españoles (paella, tortilla, gazpacho)
- Identificar el componente que aporta HC al comer fuera
- Entender que las preparaciones tradicionales varían según receta

| # | Lección |
|---|---------|
| 1 | Concepto de plato compuesto: cómo sumar raciones de varios alimentos |
| 2 | Cocina de casa: guisos, paella, tortilla y platos españoles típicos |
| 3 | Fuera de casa: tapas, bocadillos, pizzas y restaurantes |

### Nivel 5 — Integración y vida real

Integración: menús del día, comidas mixtas, alcohol e hipoglucemia tardía.

**Examen:** 6 preguntas de un pool de 17. Aprobado ≥ 70 %.

Al finalizar este nivel el alumno será capaz de:

- Planificar un menú completo estimando raciones totales
- Reconocer el efecto de grasas/proteínas en la respuesta glucémica de comidas mixtas
- Contar HC en bebidas alcohólicas y dulces de celebración
- Describir el riesgo de hipoglucemia tardía asociada al alcohol

| # | Lección |
|---|---------|
| 1 | Grasas y proteínas: impacto en la glucemia tardía (concepto avanzado) |
| 2 | Menús completos: desayunos, comidas, meriendas y cenas |
| 3 | Alcohol (riesgo de hipoglucemia tardía), celebraciones y situaciones especiales |

---

## Reglas y mediciones canónicas

### Unidad de intercambio

| Región | Regla |
|--------|-------|
| España | 10 g HC = 1 ración |
| República Dominicana | 15 g HC = 1 ración |

`raciones = carbsG / exchangeUnitG` (UI a 1 decimal).

### HC y fibra

Migajas cuenta **HC totales** por defecto. HC netos solo si el equipo de salud lo indica; el criterio varía según país, etiquetado y protocolo educativo.

### Moduladores

Proteínas y grasas **no aportan raciones de HC**, aunque **pueden modificar la respuesta glucémica** de una comida mixta.

### Verduras (política unificada)

No usamos «verduras libres» como cantidad infinita. Distinguimos:

- **Habitualmente no contabilizadas** — bajo HC en guarnición/ensalada habitual (lechuga, espinacas, pepino, tomate en taza, etc.).
- **Se contabilizan** — aporte relevante en la porción del catálogo (calabaza, zanahoria, maíz, brócoli 1 taza, judías verdes 1 taza, etc.).

### Preparaciones tradicionales

Los platos típicos (paella, tortilla, gazpacho, fabada…) **varían según receta**. El catálogo usa una porción estándar **con fines educativos**. Los ejemplos de lección pueden ilustrar otra porción; cuando difieren, el texto lo indica.

### Fichas

Las fichas favorecen el recuerdo mediante **repetición** y **recuperación activa** (porción / HC / raciones) sobre los alimentos del nivel.

---

## Errores frecuentes (educación)

| Error | Corrección Migajas |
|-------|-------------------|
| Confundir gramos de alimento con gramos de HC | El curso dedica una lección entera a esta distinción |
| Contar toda la ensalada como 0 o como mucho | Depende de la verdura y la porción; mira la ficha |
| Olvidar bebidas (zumo, leche, cerveza) | Bebidas con HC cuentan; el alcohol además implica hipoglucemia tardía |
| Usar otra marca / etiqueta distinta | Prioriza la etiqueta del producto concreto |
| Pesar cocinado cuando la ficha es otra forma | Usa la porción descrita en la ficha (taza cocida, etc.) |
| «Integral = menos HC» | Integral ≠ menos carbohidratos; cambia el tipo de harina |
| «La fruta no cuenta porque es natural» | La fruta aporta HC; la porción importa |

Serie editorial relacionada: `docs/content-library/common-mistakes.md`.

---

## Tipos de ejercicio

| Tipo | Qué mide | Nº |
|------|----------|----|
| `count_rations` | Calcular raciones | 36 |
| `multiple_choice` | Concepto | 19 |
| `identify_portion` | Reconocer porción | 14 |

---

## Porciones y mediciones (catálogo España — 179 ítems)

Raciones = HC ÷ 10. Columnas **Origen** y **Conteo** documentan precisión y política pedagógica.

| Columna | Significado |
|---------|-------------|
| Porción / g / HC | Valores de ficha |
| Raciones | HC ÷ 10 |
| Fibra | Si existe |
| Tipo | base / modulator / mixed |
| Origen | Código B/F/E/R/P |
| Base | Criterio de porción (comestible / cocido / bebida…) |
| Conteo | Se contabiliza vs habitualmente no contabilizada (verduras) |

### Pan (17)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Barra pequeña / trozo | 1 trozo | 30 | 15 | 1,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Brioche | 1 rebanada | 40 | 20 | 2,0 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Chapata | 1 rebanada | 35 | 15 | 1,5 | 1,1 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Croissant | 1 unidad | 60 | 30 | 3,0 | — | base | E · Etiquetado | Unidad comercial | Se contabiliza |
| Focaccia | 1 rebanada | 50 | 25 | 2,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan blanco | 1 rebanada | 25 | 10 | 1,0 | 0,9 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan de cristal | 1 hoja | 8 | 6 | 0,6 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan de molde | 1 rebanada | 30 | 12 | 1,2 | 0,6 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan de molde integral | 1 rebanada | 25 | 10 | 1,0 | 1,3 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan de pita | 1/2 unidad | 30 | 15 | 1,5 | 0,9 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan integral (100 g) | 100 g | 100 | 45 | 4,5 | 8 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan integral (rebanada fina) | 1 rebanada | 25 | 10 | 1,0 | 1,8 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan integral (rebanada) | 1 rebanada | 30 | 12 | 1,2 | 2,1 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan tostado | 1 rebanada | 25 | 12 | 1,2 | 0,9 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Panecillo | 1 unidad | 50 | 28 | 2,8 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Regañás | 4 unidades | 20 | 14 | 1,4 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Tostadas de pan | 2 unidades | 50 | 20 | 2,0 | 1,8 | base | B · BEDCA | Unidad comercial | Se contabiliza |

### Cereales (22)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Arroz blanco cocido | 1 taza (150 g) | 150 | 40 | 4,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Arroz cocido | 1/3 taza | 50 | 15 | 1,5 | 0,2 | base | B · BEDCA | Cocido | Se contabiliza |
| Arroz integral cocido | 1 taza (150 g) | 150 | 38 | 3,8 | 2,7 | base | B · BEDCA | Cocido | Se contabiliza |
| Avena cocida | 1/2 taza | 120 | 15 | 1,5 | 1,8 | base | B · BEDCA | Cocido | Se contabiliza |
| Barrita de cereales | 1 unidad | 25 | 18 | 1,8 | — | base | E · Etiquetado | Unidad comercial | Se contabiliza |
| Bizcocho casero | 1 porción | 60 | 25 | 2,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Cuscús cocido (1/2 taza) | 1/2 taza | 60 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Cuscús cocido (1/3 taza) | 1/3 taza | 50 | 18 | 1,8 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Donut | 1 unidad | 55 | 28 | 2,8 | — | base | E · Etiquetado | Unidad comercial | Se contabiliza |
| Galleta integral | 2 unidades | 20 | 12 | 1,2 | 0,8 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Galleta María | 3 unidades | 18 | 12 | 1,2 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Gofre | 1 unidad | 70 | 30 | 3,0 | — | base | E · Etiquetado | Unidad comercial | Se contabiliza |
| Magdalena | 1 unidad | 50 | 22 | 2,2 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Muesli | 1/2 taza | 40 | 25 | 2,5 | 2,4 | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pan rallado | 2 cucharadas | 15 | 10 | 1,0 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pasta cocida (1 taza) | 1 taza (140 g) | 140 | 35 | 3,5 | 2,5 | base | B · BEDCA | Cocido | Se contabiliza |
| Pasta cocida (1/3 taza) | 1/3 taza | 50 | 15 | 1,5 | 0,9 | base | B · BEDCA | Cocido | Se contabiliza |
| Quinoa cocida | 1/3 taza | 50 | 15 | 1,5 | 1,3 | base | B · BEDCA | Cocido | Se contabiliza |
| Sémola cocida | 1/3 taza | 50 | 20 | 2,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Tortilla de maíz | 1 unidad | 30 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Tortitas de arroz | 2 unidades | 18 | 14 | 1,4 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Trigo sarraceno cocido | 1/3 taza | 50 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |

### Tubérculos (14)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Boniato | 1/2 taza | 70 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Boniato asado | 1 boniato pequeño (130 g) | 130 | 26 | 2,6 | 3,3 | base | B · BEDCA | Cocido | Se contabiliza |
| Boniato cocido | 1/2 taza | 100 | 20 | 2,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Calabaza cocida | 1/2 taza | 100 | 10 | 1,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Nachos / patatas fritas bolsa | 1 ración | 30 | 15 | 1,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Patata al microondas | 1 mediana | 140 | 28 | 2,8 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Patata asada | 1 mediana | 150 | 30 | 3,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Patata cocida | 1 patata mediana (150 g) | 150 | 25 | 2,5 | 2,7 | base | B · BEDCA | Cocido | Se contabiliza |
| Patata cocida/asada | 1/2 taza | 75 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Patata frita | ración pequeña | 50 | 15 | 1,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Patatas fritas (ración mediana) | ración mediana (150 g) | 150 | 38 | 3,8 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Patatas fritas (ración pequeña) | ración pequeña (100 g) | 100 | 25 | 2,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Puré de patata | 1/2 taza | 100 | 15 | 1,5 | 1,5 | base | B · BEDCA | Cocido | Se contabiliza |
| Remolacha cocida | 1/2 taza | 80 | 12 | 1,2 | — | base | B · BEDCA | Cocido | Se contabiliza |

### Legumbres (8)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Alubias blancas cocidas | 1/2 taza | 100 | 15 | 1,5 | 3,5 | base | B · BEDCA | Cocido | Se contabiliza |
| Alubias cocidas | 1/2 taza | 100 | 15 | 1,5 | 3,5 | base | B · BEDCA | Cocido | Se contabiliza |
| Edamame | 1/2 taza | 80 | 8 | 0,8 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Garbanzos cocidos (1/2 taza, 100 g) | 1/2 taza | 100 | 15 | 1,5 | 4 | base | B · BEDCA | Cocido | Se contabiliza |
| Hummus | 3 cucharadas | 45 | 8 | 0,8 | — | base | B · BEDCA | Plato | Se contabiliza |
| Lentejas cocidas (1 plato) | 1 plato (200 g) | 200 | 24 | 2,4 | 10 | base | B · BEDCA | Cocido | Se contabiliza |
| Lentejas cocidas (1/2 taza) | 1/2 taza | 100 | 15 | 1,5 | 5 | base | B · BEDCA | Cocido | Se contabiliza |
| Soja cocida | 1/2 taza | 90 | 10 | 1,0 | 2,7 | base | B · BEDCA | Cocido | Se contabiliza |

### Fruta (25)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Albaricoque | 3 unidades | 105 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Arándanos | 1 taza | 140 | 15 | 1,5 | 3,5 | base | B · BEDCA | Comestible | Se contabiliza |
| Cerezas | 1 taza | 120 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Ciruela | 2 unidades | 120 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Compota de manzana | 1/2 taza | 120 | 20 | 2,0 | — | base | B · BEDCA | Plato | Se contabiliza |
| Dátil | 2 unidades | 40 | 25 | 2,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Frambuesas | 1 taza | 120 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Fresas | 1 taza | 150 | 10 | 1,0 | 3 | base | B · BEDCA | Comestible | Se contabiliza |
| Granada | 1/2 taza | 90 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Higo | 2 unidades | 100 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Kiwi | 1 unidad | 75 | 10 | 1,0 | 1,9 | base | B · BEDCA | Comestible | Se contabiliza |
| Mandarina | 1 unidad | 100 | 12 | 1,2 | 2 | base | B · BEDCA | Comestible | Se contabiliza |
| Manzana pequeña | 1 unidad | 120 | 15 | 1,5 | 2,4 | base | B · BEDCA | Comestible | Se contabiliza |
| Melocotón | 1 unidad | 150 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Melón | 1 taza | 150 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Moras | 1 taza | 140 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Naranja pequeña | 1 unidad | 130 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Pasas | 2 cucharadas | 30 | 20 | 2,0 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Pera pequeña | 1 unidad | 120 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Piña | 1 taza | 140 | 15 | 1,5 | 2,1 | base | B · BEDCA | Comestible | Se contabiliza |
| Piña en almíbar | 100 g | 100 | 20 | 2,0 | — | base | B · BEDCA | Plato | Se contabiliza |
| Plátano pequeño | 1 unidad | 90 | 15 | 1,5 | 1,4 | base | B · BEDCA | Comestible | Se contabiliza |
| Sandía | 1 taza | 150 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Uvas | 15-17 uvas | 100 | 15 | 1,5 | 1 | base | B · BEDCA | Comestible | Se contabiliza |
| Zumo de naranja | 1 vaso | 200 | 22 | 2,2 | — | base | B · BEDCA | Bebida | Se contabiliza |

### Verdura (20)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Apio | 1 taza | 120 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Berenjena | 1/2 taza | 80 | 8 | 0,8 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Brócoli cocido | 1 taza | 90 | 10 | 1,0 | 2,3 | base | B · BEDCA | Cocido | Se contabiliza |
| Calabacín | 1 taza | 120 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Calabaza | 1 taza | 200 | 15 | 1,5 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Cebolla | 1/2 taza | 80 | 8 | 0,8 | — | base | E · Etiquetado | Cocido | Se contabiliza |
| Champiñones | 1 taza | 70 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Coliflor cocida | 1 taza | 100 | 5 | 0,5 | — | base | B · BEDCA | Cocido | Habitualmente no contabilizada |
| Ensalada mixta | 100 g | 100 | 5 | 0,5 | 1,5 | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Espinacas cocidas | 1/2 taza | 90 | 5 | 0,5 | 1,8 | base | B · BEDCA | Cocido | Habitualmente no contabilizada |
| Guisantes cocidos | 100 g | 100 | 14 | 1,4 | 5 | base | B · BEDCA | Cocido | Se contabiliza |
| Judías verdes cocidas | 1 taza | 80 | 10 | 1,0 | 2 | base | B · BEDCA | Cocido | Se contabiliza |
| Lechuga | 2 tazas | 100 | 5 | 0,5 | 1 | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Maíz en grano | 100 g | 100 | 19 | 1,9 | 2 | base | B · BEDCA | Cocido | Se contabiliza |
| Pepino | 1 taza | 120 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Pimiento | 1/2 taza | 75 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Tomate (1 taza) | 1 taza | 180 | 8 | 0,8 | — | base | B · BEDCA | Comestible | Habitualmente no contabilizada |
| Tomate (ración grande) | ración grande | 300 | 10 | 1,0 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Zanahoria cocida | 1/2 taza | 80 | 10 | 1,0 | — | base | B · BEDCA | Cocido | Se contabiliza |
| Zanahoria cruda | 1 taza | 120 | 10 | 1,0 | — | base | B · BEDCA | Cocido | Se contabiliza |

### Lácteos (16)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Bebida de avena | 1 taza | 200 | 16 | 1,6 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Bebida de soja | 1 taza | 200 | 8 | 0,8 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Helado | 1 bola | 50 | 15 | 1,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Leche | 1 taza / 250 ml | 250 | 12 | 1,2 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Leche desnatada | 1 taza | 250 | 12 | 1,2 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Leche entera | 1 taza | 250 | 12 | 1,2 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Leche semidesnatada (1 taza / 250 ml) | 1 taza | 250 | 12 | 1,2 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Leche semidesnatada (vaso 200 ml) | 1 vaso (200 ml) | 200 | 10 | 1,0 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Mantequilla | 1 cucharada | 14 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Bebida | Se contabiliza |
| Mozzarella | 1 porción | 30 | 1 | 0,1 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Nata líquida | 2 cucharadas | 30 | 1 | 0,1 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Queso azul | 1 porción | 30 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Queso cottage | 1/2 taza | 100 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Queso fresco | 1 porción | 60 | 3 | 0,3 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Yogur azucarado | 1 unidad | 125 | 10 | 1,0 | — | base | B · BEDCA | Comestible | Se contabiliza |
| Yogur natural | 1 unidad | 125 | 5 | 0,5 | — | base | B · BEDCA | Comestible | Se contabiliza |

### Proteína (12)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Atún | 1 lata pequeña | 80 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Carne | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Huevo | 1 unidad | 60 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Jamón serrano | 2 lonchas | 30 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Merluza | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Pavo | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Pechuga de pollo | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Pescado | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Pollo | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Queso curado | 1 porción | 30 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Salmón | 1 porción | 100 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Tofu | 1/2 taza | 120 | 3 | 0,3 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |

### Grasa (2)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Aceite de oliva | 1 cucharada | 10 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |
| Nueces | 30 g | 30 | 3 | 0,3 | 2,1 | modulator | P · Estimación pedagógica | Unidad comercial | Se contabiliza |

### Plato mixto (31)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Arroz con leche | 1 ración | 200 | 35 | 3,5 | — | mixed | P · Estimación pedagógica | Bebida | Se contabiliza |
| Bocadillo de barra (estimado) | 1 unidad (~100 g de pan) | 150 | 50 | 5,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Bocadillo de jamón | 1 unidad | 150 | 50 | 5,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Brownie | 1 porción | 60 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Calamares a la romana | 100 g | 100 | 15 | 1,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Chocolate negro (~50–60 % cacao) | 2 cuadrados | 20 | 12 | 1,2 | — | mixed | E · Etiquetado | Plato | Se contabiliza |
| Churro | 1 unidad | 40 | 20 | 2,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Cocido madrileño | 1 plato | 350 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Crema de verduras | 1 bol | 300 | 20 | 2,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Croqueta | 2 unidades | 60 | 15 | 1,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Empanada | 1 unidad | 120 | 25 | 2,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Ensalada de pasta | 1 plato | 250 | 35 | 3,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Fabada | 1 plato | 300 | 35 | 3,5 | 12 | mixed | R · Receta estándar | Plato | Se contabiliza |
| Flan | 1 ración | 120 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Gazpacho | 1 bol | 300 | 15 | 1,5 | 3 | mixed | R · Receta estándar | Plato | Se contabiliza |
| Lasaña | 1 porción | 250 | 35 | 3,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Lentejas estofadas | 1 plato | 300 | 30 | 3,0 | 15 | mixed | R · Receta estándar | Plato | Se contabiliza |
| Mermelada | 1 cucharada | 20 | 12 | 1,2 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Miel | 1 cucharada | 21 | 17 | 1,7 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Paella | 1 plato | 300 | 45 | 4,5 | 3 | mixed | R · Receta estándar | Plato | Se contabiliza |
| Pasta carbonara | 1 plato | 250 | 45 | 4,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Pasta con tomate | 1 plato | 300 | 40 | 4,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Pizza margarita | 1 porción | 150 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Pizza pepperoni | 1 porción | 125 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Pulpo a la gallega (con patata) | 1 plato | 200 | 10 | 1,0 | — | mixed | R · Receta estándar | Plato | Se contabiliza |
| Risotto | 1 plato | 250 | 45 | 4,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Sandwich mixto | 1 unidad | 150 | 30 | 3,0 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Sopa de lentejas | 1 bol | 300 | 25 | 2,5 | 12 | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Tarta de queso | 1 porción | 100 | 25 | 2,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |
| Tortilla de patata | 1 porción (~180 g) | 180 | 20 | 2,0 | — | mixed | R · Receta estándar | Plato | Se contabiliza |
| Tortilla francesa | 1 porción | 120 | 5 | 0,5 | — | mixed | P · Estimación pedagógica | Plato | Se contabiliza |

### Bebida (6)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Agua | 1 vaso | 250 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Bebida | Se contabiliza |
| Café solo | 1 taza | 200 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Bebida | Se contabiliza |
| Cerveza lager (caña) | 1 caña (200 ml) | 200 | 10 | 1,0 | — | base | B · BEDCA | Bebida | Se contabiliza |
| Cerveza sin alcohol | 1 caña (200 ml) | 200 | 5 | 0,5 | — | base | E · Etiquetado | Bebida | Se contabiliza |
| Té | 1 taza | 200 | 0 | 0,0 | — | modulator | P · Estimación pedagógica | Bebida | Se contabiliza |
| Vino tinto seco | 1 copa (100 ml) | 100 | 3 | 0,3 | — | base | B · BEDCA | Bebida | Se contabiliza |

### Dulce (2)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Chocolate con leche | 100 g | 100 | 50 | 5,0 | — | base | E · Etiquetado | Bebida | Se contabiliza |
| Tarta de cumpleaños | 100 g | 100 | 45 | 4,5 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |

### Salsa (3)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Kétchup | 1 cucharada | 15 | 4 | 0,4 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Salsa barbacoa | 1 cucharada (15 g) | 15 | 6 | 0,6 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |
| Tomate frito | 2 cucharadas (50 g) | 50 | 6 | 0,6 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |

### Embutido (1)

| Alimento | Porción | g | HC (g) | Raciones | Fibra | Tipo | Origen | Base | Conteo |
|----------|---------|---|--------|----------|-------|------|--------|------|--------|
| Embutido con almidón | 2 lonchas (50 g) | 50 | 8 | 0,8 | — | base | B · BEDCA | Unidad comercial | Se contabiliza |

---

## Notas de revisión (transparencia)

El sistema se autoaudita (`npm run audit:foods`). Hallazgos ya abordados en v3:

| Tema | Estado |
|------|--------|
| Verduras «libres» | Unificado: bajo HC / habitualmente no contabilizadas vs ficha |
| Judías verdes / brócoli | Contabilizan en porción de catálogo (~10 g HC) |
| Gazpacho / tortilla | Lecciones alineadas con catálogo + nota de variabilidad de receta |
| Duplicados exactos ES/RD | Eliminados |
| Agua / café / té | Categoría Bebida |
| Bocadillo genérico | Ajustado a ~50 g HC (pan ~100 g) |
| Chocolate negro | Especificado % cacao típico |
| Umbral aprobado | Documentado y fijado en 70 % |
| Origen del dato | Campo `dataSource` en catálogo |

Checklist revisor:

- [ ] ¿10 g = 1 ración es el protocolo del servicio destino?
- [ ] ¿HC totales por defecto es aceptable?
- [ ] ¿La política de verduras encaja con el protocolo local?
- [ ] ¿Las estimaciones de platos mixtos se aceptan como educativas?
- [ ] Auditoría BEDCA puntual de alimentos básicos antes de piloto formal

---

## Alineación científica (referencias)

Currículo alineado con:

- Sociedad Española de Diabetes (SED) — educación terapéutica estructurada
- Sociedad Española de Endocrinología y Nutrición (SEEN)
- European Association for the Study of Diabetes (EASD)
- Sistema español de intercambio de raciones (10 g HC = 1 ración)
- BEDCA (AESAN) como referencia de composición para alimentos básicos ES
- FEN — fibra y verdura

Detalle de fuentes en producto: `src/lib/domain/content-sources.ts`.

---

## Claims permitidos / prohibidos

| Decir | No decir |
|-------|----------|
| Aprender a contar carbohidratos | «Controla tu diabetes» |
| Alimentos y preparaciones habituales | Calcula insulina |
| Autoevaluación (≥ 70 %) | Sustituye al equipo de salud |
| Complemento entre talleres | Dispositivo médico |

---

## Next step

Outreach: [OUTREACH-90D-ACTION-PLAN.md](./OUTREACH-90D-ACTION-PLAN.md). QA catálogo: `npm run audit:foods`.
