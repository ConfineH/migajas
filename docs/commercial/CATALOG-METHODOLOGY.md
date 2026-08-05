# Metodología de construcción del catálogo — Migajas

**Documento de gobernanza del dato** · Versión catálogo `2026.08-v4` · Ago 2026  
**Audiencia:** dietista-nutricionista, enfermera educadora, comité científico / innovación.  
**Relacionado:** [CURRICULUM-INVENTORY.md](./CURRICULUM-INVENTORY.md) · [AUDIT-BRIEF.md](./AUDIT-BRIEF.md)

---

## En una frase

El catálogo de Migajas **no pretende** que cada plato compuesto tenga un valor oficial BEDCA; pretende **trazabilidad**: de dónde sale cada cifra, con qué criterio de porción y cómo se convierte a raciones.

---

## Principios

1. **Alimento simple** → prioritariamente **BEDCA** (AESAN) u homólogo de tablas españolas.  
2. Cuando BEDCA no dispone de equivalente → **tablas españolas reconocidas**, **etiquetado nutricional** o estimación documentada.  
3. **Platos compuestos** → **receta estándar Migajas** con finalidad **exclusivamente educativa** (varían según elaboración real).  
4. **Producto comercial** → **etiquetado fabricante** / valor típico de marca.  
5. Todas las raciones ES se calculan con **10 g HC = 1 ración** (`raciones = carbsG / 10`).  
6. Migajas cuenta **HC totales** por defecto (no resta fibra salvo indicación del equipo de salud).  
7. Las estimaciones se **revisan periódicamente**; la revisión externa queda registrada en gobernanza.

---

## Códigos de trazabilidad (cerrados)

| Código | Fuente | Cuándo |
|--------|--------|--------|
| **B** | BEDCA | Alimento simple alineado con BEDCA / tablas ES |
| **F** | FEN | Criterio u orientación FEN (poco frecuente como fuente de HC) |
| **E** | Etiquetado fabricante | Producto comercial / valor típico de etiqueta |
| **R** | Receta estándar Migajas | Plato compuesto a partir de componentes habituales |
| **P** | Estimación pedagógica validada | Sin valor oficial único, o multi-fuente (p. ej. RD) |

En el JSON: campo `provenanceCode`.  
En el inventario: columna **Origen** muestra el código + etiqueta.

Campos de gobernanza previstos (por ítem o a nivel de catálogo):

| Campo | Uso |
|-------|-----|
| `catalogVersion` / gobernanza global | Versión del catálogo publicado |
| `reviewedAt` / `reviewedBy` | Quién firmó la revisión externa (cuando exista) |
| `portionBasis` | Criterio de la porción listada (ver abajo) |
| `notes` | Matices (variabilidad de receta, tipo de cerveza, etc.) |

---

## Criterios de porción (`portionBasis`)

| Código | Significado | Grupos típicos |
|--------|-------------|----------------|
| `edible` | Parte comestible habitual | Frutas enteras / piezas |
| `cooked` | Cocido / listo para comer | Arroz, pasta, legumbres, tubérculos cocidos |
| `dry` | Seco / crudo antes de cocinar | *(no usado en el catálogo ES actual para cereales/legumbres)* |
| `beverage` | Volumen servido | Agua, café, leche, zumo, cerveza, vino |
| `prepared_dish` | Plato / preparación | Paella, gazpacho, tortilla, pizza… |
| `commercial_unit` | Unidad de venta | Lonchas, bollería, barritas |

### Reglas de consistencia (ES)

| Grupo | Criterio Migajas |
|-------|------------------|
| **Arroz y pasta** | Siempre **cocidos** (nunca crudos en el catálogo guiado) |
| **Legumbres** | Siempre **cocidas** (o preparaciones tipo hummus); no se mezclan secas y cocidas |
| **Frutas** | Porción sobre **parte comestible** habitual (pieza / taza comestible), no peso bruto con residuos |
| **Pan** | Porción = **rebanada / trozo / unidad** tipificada; además existe ficha de 100 g solo como ejemplo de etiqueta |
| **Bebidas** | Diferenciadas por tipo (agua, café, té, zumo, cerveza lager, vino tinto seco); el alcohol usa valores educativos estándar y nota de variabilidad |

---

## Qué NO es este catálogo

- No es una base de composición certificada para etiquetado legal.  
- No sustituye la etiqueta del producto concreto del paciente.  
- No calcula insulina ni dosis.  
- No afirma que paella / bocadillo / pizza tengan un único valor BEDCA.

---

## Proceso de revisión

| Estado | Significado |
|--------|-------------|
| `pending_external` | Catálogo con QA interna + auditoría automática; **pendiente** firma D-N / enfermera educadora |
| `externally_reviewed` | Revisado y firmado; se rellenan `reviewedAt` y `reviewedBy` |

Auditoría automática continua: `npm run audit:foods` (HC ≥ 0, fibra ≤ HC, duplicados, origen obligatorio, nombres casi duplicados, etc.).

---

## Encargo sugerido al revisor externo

Ver [AUDIT-BRIEF.md](./AUDIT-BRIEF.md).
