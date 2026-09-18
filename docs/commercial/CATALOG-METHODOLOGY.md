# Metodología de construcción del catálogo — Migajas

**Documento de gobernanza del dato** · Versión catálogo `2026.09-v5` · Sep 2026  
**Audiencia:** dietista-nutricionista, enfermera educadora, comité científico / innovación.  
**Relacionado:** [CURRICULUM-INVENTORY.md](./CURRICULUM-INVENTORY.md) · [AUDIT-BRIEF.md](./AUDIT-BRIEF.md)

---

## En una frase

El catálogo de Migajas **no pretende** que cada plato compuesto tenga un valor oficial BEDCA; pretende **trazabilidad**: de dónde sale cada cifra, con qué criterio de porción y cómo se convierte a raciones.

---

## Principios

1. **Alimento simple ES** → **BEDCA** (AESAN) + tabla de raciones de **Serafín Murillo** (Fundación para la Salud / CIBERDEM; fuentes BEDCA, CESNID, HSJD).  
2. **Alimento simple RD** → **TCA-INCAP 2018** (INCAP/OPS, cubre República Dominicana) y, cuando la ficha no está en abierto, **USDA FoodData Central**. Las porciones de enseñanza de 15 g siguen **ADA / CDC**.  
3. **Platos compuestos** → **receta estándar Migajas** educativa (varían según elaboración real).  
4. **Producto comercial** → **etiquetado fabricante** / valor típico de marca.  
5. Raciones: **España 10 g HC = 1 ración**; **República Dominicana 15 g HC = 1 ración**. `raciones = carbsG / exchangeUnitG`. No se mezclan los dos sistemas en el mismo país.  
6. Migajas cuenta **HC totales** por defecto (no resta fibra). En RD eso hace que 100 g de habichuelas sean **~1,5 raciones**, no 1: el intercambio ADA de 15 g aproxima HC disponibles.  
7. Las estimaciones se **revisan periódicamente**; la revisión externa queda registrada en gobernanza.

---

## Códigos de trazabilidad (cerrados)

| Código | Fuente | Cuándo |
|--------|--------|--------|
| **B** | BEDCA | Alimento simple alineado con BEDCA / tablas ES |
| **F** | FEN | Criterio u orientación FEN (poco frecuente como fuente de HC) |
| **E** | Etiquetado fabricante | Producto comercial / valor típico de etiqueta |
| **R** | Receta estándar Migajas | Plato compuesto a partir de componentes habituales |
| **P** | Estimación pedagógica validada | Sin valor oficial único |
| **I** | INCAP / USDA | Composición RD (TCA-INCAP o FoodData Central) |

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

### Reglas de consistencia (ES y RD)

| Grupo | Criterio Migajas |
|-------|------------------|
| **Arroz y pasta** | Siempre **cocidos** (nunca crudos en el catálogo guiado) |
| **Legumbres / habichuelas** | Siempre **cocidas**; no se mezclan secas y cocidas |
| **Frutas** | Porción sobre **parte comestible** habitual (pieza / taza comestible), no peso bruto con residuos |
| **Pan** | Porción = **rebanada / trozo / unidad** tipificada |
| **Bebidas** | Volumen servido; en RD 1 taza de leche ≈ **12 g HC** (ADA), no 15 |
| **Yuca, plátano, mangú** | Cocidos / listos para comer; 1 ración RD ≈ ⅓ taza (ADA/CDC) |

### Dos sistemas de ración (no intercambiables)

| País | 1 ración | Fuente de la regla | Fuente de la composición |
|------|----------|--------------------|---------------------------|
| España | **10 g HC** | SED / educadores; tabla Murillo 3ª ed.; HSJD | BEDCA (AESAN) + Murillo |
| República Dominicana | **15 g HC** | ADA, CDC; HSJD (Latinoamérica); uso clínico habitual en RD | INCAP TCA + USDA FDC; MSP Pilón ancla INCAP al país |

El mismo plato físico **no** tiene las mismas raciones en ES y en RD. Ejemplo: 100 g de lentejas/habichuelas cocidas ≈ 20–23 g HC → **2 raciones ES** y **~1,5 raciones RD**.

Detalle numérico: [CATALOG-OFFICIAL-ALIGNMENT.md](./CATALOG-OFFICIAL-ALIGNMENT.md).

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
