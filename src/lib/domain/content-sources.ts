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
    url: "https://diabetes.org/",
    scope: "clinical-guideline",
    summary:
      "Orientación sobre carbohidratos, plato equilibrado y elección de alimentos en diabetes.",
    regionIds: ["es"],
  },
  {
    id: "migajas-exchange-unit",
    title: "Ración de carbohidratos en España (10 g = 1 ración)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "Regla de conversión usada en el curso guiado y en la calculadora de la guía.",
    regionIds: ["es"],
  },
  {
    id: "migajas-fiber-policy",
    title: "HC totales y fibra",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "El curso enseña HC netos cuando la etiqueta lo permite, pero Migajas cuenta HC totales por defecto.",
    regionIds: ["es"],
  },
  {
    id: "migajas-modulators",
    title: "Moduladores (0 raciones de HC)",
    publisher: "Migajas",
    url: "/guia",
    scope: "methodology",
    summary:
      "Proteínas y grasas puras no suman raciones; pueden retrasar la absorción de carbohidratos.",
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
  if (notes.includes("BEDCA")) return "bedca";
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
