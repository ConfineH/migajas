export type SourceScope =
  | "nutrition-data"
  | "clinical-guideline"
  | "methodology";

export interface ContentSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  scope: SourceScope;
  summary: string;
  regionIds?: string[];
}

export const EDUCATIONAL_DISCLAIMER =
  "Contenido educativo. No sustituye el consejo médico ni las pautas personalizadas de tu equipo de salud.";

export const SOURCE_SCOPES: Record<SourceScope, string> = {
  "nutrition-data": "Datos nutricionales",
  "clinical-guideline": "Guías clínicas",
  methodology: "Metodología Migajas",
};

const CONTENT_SOURCES: ContentSource[] = [
  {
    id: "bedca",
    title: "BEDCA — Base de Datos Española de Composición de Alimentos",
    publisher: "AESAN / BEDCA",
    url: "https://www.bedca.net/bdpub/",
    scope: "nutrition-data",
    summary:
      "Composición de alimentos y bebidas comercializados en España. Referencia para HC y porciones del catálogo ES.",
    regionIds: ["es"],
  },
  {
    id: "fen",
    title: "Fundación Española de la Nutrición (FEN)",
    publisher: "FEN",
    url: "https://www.fen.org.es/",
    scope: "clinical-guideline",
    summary:
      "Recomendaciones sobre fibra, verdura, legumbres y alimentación saludable citadas en el curso.",
    regionIds: ["es"],
  },
  {
    id: "ada",
    title: "American Diabetes Association (ADA)",
    publisher: "ADA",
    url: "https://diabetes.org/es/alimentos-nutricion/entender-los-carbohidratos/conteo-de-carbohidratos-y-diabetes",
    scope: "clinical-guideline",
    summary:
      "Conteo de carbohidratos y «elecciones» de ~15 g. Referencia clínica para RD y contraste con la ración española de 10 g.",
    regionIds: ["es", "do"],
  },
  {
    id: "migajas-exchange-unit",
    title: "Ración de carbohidratos en España (10 g = 1 ración)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "Regla de conversión usada en el curso guiado y en la calculadora de la guía en España.",
    regionIds: ["es"],
  },
  {
    id: "migajas-exchange-unit-do",
    title: "Ración de carbohidratos en República Dominicana (15 g = 1 ración)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "En RD una ración son 15 g de carbohidratos (ADA/CDC / uso habitual en Latinoamérica). No se usa la ración española de 10 g.",
    regionIds: ["do"],
  },
  {
    id: "migajas-fiber-policy",
    title: "HC totales y fibra",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "El curso enseña HC netos cuando la etiqueta lo permite, pero Migajas cuenta HC totales por defecto.",
    regionIds: ["es", "do"],
  },
  {
    id: "migajas-modulators",
    title: "Moduladores (sin raciones de HC)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "Proteínas y grasas puras no aportan raciones de HC; pueden modificar la respuesta glucémica en comidas mixtas.",
    regionIds: ["es", "do"],
  },
  {
    id: "migajas-veg-policy",
    title: "Verduras de bajo HC (habitualmente no contabilizadas)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "No usamos «verduras libres» como cantidad infinita. Algunas verduras en guarnición habitual no se contabilizan; otras sí según la ficha del catálogo.",
    regionIds: ["es", "do"],
  },
  {
    id: "murillo-raciones",
    title: "Tabla de raciones de hidratos de carbono (Serafín Murillo)",
    publisher: "Fundación para la Salud Novo Nordisk / CIBERDEM",
    url: "https://www.fundacionparalasalud.org/diamundial/tabla_de_raciones_de_hidratos_de_carbono",
    scope: "nutrition-data",
    summary:
      "3ª edición. 10 g HC = 1 ración. Fuentes: BEDCA, CESNID, Hospital Sant Joan de Déu. Referencia de porciones del catálogo ES.",
    regionIds: ["es"],
  },
  {
    id: "sjd-raciones",
    title: "Raciones de hidratos de carbono (Hospital Sant Joan de Déu)",
    publisher: "Hospital Sant Joan de Déu Barcelona",
    url: "https://diabetes.sjdhospitalbarcelona.org/es/diabetes-tipo-1/raciones-hidratos-carbono",
    scope: "clinical-guideline",
    summary:
      "Documenta los dos sistemas: 1 ración = 10 g (España y gran parte de Europa) y 1 ración = 15 g (México y gran parte de Latinoamérica).",
    regionIds: ["es", "do"],
  },
  {
    id: "incap-tca",
    title: "Tabla de Composición de Alimentos de Centroamérica (TCA-INCAP)",
    publisher: "INCAP / OPS",
    url: "https://www.fao.org/food-composition/tables-and-databases/detail/(multiple-countries--2018)-tabla-de-composici%C3%B3n-de-alimentos-de-centro-am%C3%A9rica/en",
    scope: "nutrition-data",
    summary:
      "3ª edición 2018. INCAP es el centro de OPS/OMS en alimentación para Centroamérica y República Dominicana. Referencia de composición para el catálogo RD.",
    regionIds: ["do"],
  },
  {
    id: "usda-fdc",
    title: "USDA FoodData Central",
    publisher: "USDA",
    url: "https://fdc.nal.usda.gov/",
    scope: "nutrition-data",
    summary:
      "Composición analítica por 100 g (arroz cocido, yuca, plátano, habichuelas, frutas). Usada cuando la ficha INCAP no está publicada en abierto.",
    regionIds: ["do"],
  },
  {
    id: "ada-carb-choice",
    title: "Elección de carbohidratos ADA / CDC (15 g)",
    publisher: "ADA / CDC",
    url: "https://www.cdc.gov/diabetes/es/healthy-eating/contar-carbohidratos.html",
    scope: "clinical-guideline",
    summary:
      "1 ración de carbohidratos ≈ 15 g. Leche: ~12 g por taza. 1/3 taza de arroz, yuca o plátano cocidos ≈ 1 elección.",
    regionIds: ["do"],
  },
  {
    id: "msp-pilon",
    title: "Pilón de la alimentación y nutrición",
    publisher: "Ministerio de Salud Pública de la República Dominicana",
    url: "https://repositorio.msp.gob.do/bitstream/handle/123456789/270/9789945436457.pdf",
    scope: "clinical-guideline",
    summary:
      "Guía alimentaria oficial dominicana. Usa recomendaciones del INCAP (OPS) y FAO; no define por sí sola la ración de 15 g, pero ancla las tablas de composición al país.",
    regionIds: ["do"],
  },
  {
    id: "sed-education",
    title: "Educación terapéutica estructurada (SED)",
    publisher: "Sociedad Española de Diabetes",
    url: "https://www.sediabetes.org/",
    scope: "clinical-guideline",
    summary:
      "Referencia de programas de educación diabetológica estructurados, con objetivos, evaluación y adaptación al paciente.",
    regionIds: ["es"],
  },
  {
    id: "seen",
    title: "Sociedad Española de Endocrinología y Nutrición (SEEN)",
    publisher: "SEEN",
    url: "https://www.seen.es/",
    scope: "clinical-guideline",
    summary:
      "Marco clínico-nutricional de referencia en España para educación y nutrición en diabetes.",
    regionIds: ["es"],
  },
  {
    id: "easd",
    title: "European Association for the Study of Diabetes (EASD)",
    publisher: "EASD",
    url: "https://www.easd.org/",
    scope: "clinical-guideline",
    summary:
      "Orientación europea sobre diabetes; usada como referencia de rigor educativo, no como claim de dispositivo médico.",
    regionIds: ["es"],
  },
];

export function getAllSources(): ContentSource[] {
  return CONTENT_SOURCES;
}

export function getSourceById(id: string): ContentSource | undefined {
  return CONTENT_SOURCES.find((source) => source.id === id);
}

export function getSourcesForRegion(regionId: string): ContentSource[] {
  return CONTENT_SOURCES.filter(
    (source) => !source.regionIds || source.regionIds.includes(regionId),
  );
}

export function groupSourcesByScope(
  sources: ContentSource[],
): Record<string, ContentSource[]> {
  const grouped: Record<string, ContentSource[]> = {};
  for (const source of sources) {
    const label = SOURCE_SCOPES[source.scope];
    grouped[label] ??= [];
    grouped[label].push(source);
  }
  return grouped;
}

export function inferFoodSourceId(food: {
  notes?: string;
  sourceId?: string;
}): string | null {
  if (food.sourceId) return food.sourceId;
  const notes = food.notes?.toUpperCase() ?? "";
  if (notes.includes("BEDCA") || notes.includes("MURILLO")) return "bedca";
  if (notes.includes("INCAP")) return "incap-tca";
  if (notes.includes("USDA")) return "usda-fdc";
  if (notes.includes("ADA") || notes.includes("CDC")) return "ada-carb-choice";
  return null;
}

export function resolveStepSourceIds(step: {
  sourceIds?: string[];
  title?: string;
  body?: string;
}): string[] {
  if (step.sourceIds?.length) {
    return step.sourceIds.filter((id) => getSourceById(id));
  }

  const text = `${step.title ?? ""} ${step.body ?? ""}`;
  const inferred: string[] = [];
  if (/\bFEN\b/.test(text)) inferred.push("fen");
  if (/\bADA\b/.test(text)) inferred.push("ada");
  if (/Migajas cuenta HC/i.test(text)) inferred.push("migajas-fiber-policy");
  if (/modulador/i.test(text) && /0 raciones/i.test(text)) {
    inferred.push("migajas-modulators");
  }

  return inferred.filter((id, index, all) => all.indexOf(id) === index);
}
