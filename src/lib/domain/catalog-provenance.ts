/**
 * Closed provenance codes for catalog governance (auditor / hospital facing).
 * B = BEDCA · F = FEN · E = etiquetado · R = receta estándar · P = estimación pedagógica
 */
export type ProvenanceCode = "B" | "F" | "E" | "R" | "P";

export const PROVENANCE_CODES: Record<
  ProvenanceCode,
  { label: string; description: string }
> = {
  B: {
    label: "BEDCA",
    description:
      "Valor alineado con BEDCA (AESAN) u homólogo de tablas españolas para el alimento simple.",
  },
  F: {
    label: "FEN",
    description:
      "Referencia de la Fundación Española de la Nutrición (orientación / criterio educativo).",
  },
  E: {
    label: "Etiquetado fabricante",
    description:
      "Producto comercial: valor típico de etiqueta o ficha de fabricante.",
  },
  R: {
    label: "Receta estándar Migajas",
    description:
      "Plato compuesto a partir de componentes habituales; receta estándar con fin educativo.",
  },
  P: {
    label: "Estimación pedagógica validada",
    description:
      "Estimación educativa documentada cuando no hay valor oficial único (o tablas multi-fuente RD).",
  },
};

/** How the listed grams relate to the food as eaten / measured. */
export type PortionBasis =
  | "edible"
  | "as_purchased"
  | "cooked"
  | "dry"
  | "beverage"
  | "prepared_dish"
  | "commercial_unit";

export const PORTION_BASIS_LABELS: Record<PortionBasis, string> = {
  edible: "Parte comestible (sin residuos no comidos habitualmente)",
  as_purchased: "Tal cual se compra (puede incluir piel no comestible)",
  cooked: "Cocido / listo para comer",
  dry: "Seco / crudo (antes de cocinar)",
  beverage: "Volumen de bebida servida",
  prepared_dish: "Plato / preparación servida",
  commercial_unit: "Unidad comercial (loncha, bollo, etc.)",
};

/** Legacy dataSource → closed provenance code */
export function provenanceFromDataSource(
  dataSource: string | undefined,
): ProvenanceCode {
  switch (dataSource) {
    case "bedca_aligned":
      return "B";
    case "bedca_standard_recipe":
      return "R";
    case "label_or_typical":
      return "E";
    case "multi_source":
      return "P";
    case "pedagogical_estimate":
      return "P";
    default:
      return "P";
  }
}

export interface CatalogGovernance {
  version: string;
  exchangeRuleEs: string;
  exchangeRuleRd: string;
  reviewStatus: "pending_external" | "externally_reviewed";
  reviewedAt: string | null;
  reviewedBy: string | null;
  nextReviewDue: string | null;
  methodologyPath: string;
}

export const CATALOG_GOVERNANCE: CatalogGovernance = {
  version: "2026.08-v4",
  exchangeRuleEs: "10 g HC = 1 ración",
  exchangeRuleRd: "15 g HC = 1 ración",
  reviewStatus: "pending_external",
  reviewedAt: null,
  reviewedBy: null,
  nextReviewDue: null,
  methodologyPath: "docs/commercial/CATALOG-METHODOLOGY.md",
};
