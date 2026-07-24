/**
 * Canonical brand copy and marketing guardrails.
 * Arc: entender → practicar → confiar (clinical mode = secondary layer).
 */

export const PRODUCT_ARC = ["entender", "practicar", "confiar"] as const;

export type ProductArcStep = (typeof PRODUCT_ARC)[number];

export const BRAND_FOUNDATION =
  "Migajas comunica una forma de aprender. La app es el lugar donde ese aprendizaje ocurre.";

export const BRAND_OUTCOME = "Ahora lo entiendo mejor.";

export const BRAND_ONE_LINER =
  "Aprende a contar carbohidratos con comida real de tu país — paso a paso, con tranquilidad.";

export const HERO_COPY = {
  headline:
    "Bienvenido a Migajas. Tu guía amable para el conteo de carbohidratos.",
  subtitle:
    "Aprende a relacionar comida real de tu país con confianza y tranquilidad.",
  ctaPrimary: "Empezar mi curso",
  ctaSecondary: "Ya empecé — continuar",
} as const;

export const SEO_COPY = {
  title: "Migajas — Aprende a contar carbohidratos",
  description:
    "Tu guía amable para el conteo de carbohidratos con comida real de tu país.",
  openGraphDescription:
    "Un curso guiado para relacionar gramos, carbohidratos y raciones con comida real de tu país.",
  openGraphAlt:
    "Migajas — Aprende a contar carbohidratos con comida real de tu país",
} as const;

/** Editorial voice: plural brand ("empezamos") or impersonal, not founder-first. */
export const BRAND_VOICE = "editorial-plural" as const;

export const TERRITORY_RULE =
  "Cada pieza con comida o cifras debe ser ES o RD, nunca mezclada en la misma publicación.";

export const FEED_COURSE_RELATION =
  "Autónomo pero resonante: el feed no requiere la app; los temas hacen eco del currículo sin seguir el orden de niveles.";

export const EDITORIAL_DISCLAIMER_SHORT =
  "Contenido educativo. No sustituye el consejo de profesionales sanitarios.";

export const EDITORIAL_DISCLAIMER_LONG =
  "Migajas es una herramienta educativa para aprender a contar carbohidratos. No ofrece recomendaciones médicas ni de tratamiento.";

export const MEDICAL_QUESTION_RESPONSE =
  "Migajas está centrada en la educación sobre el conteo de carbohidratos. Si tu duda es sobre tratamiento, insulina o ajustes médicos, lo más adecuado es comentarla con tu equipo sanitario.";

export const BRAND_VISUAL_TOKENS = {
  background: "#f9f7f1",
  sage: "#6b7f62",
  sageLight: "#b8c9af",
  terracotta: "#d98a6d",
  foreground: "#3d3429",
  muted: "#6b635a",
  displayFont: "Playfair Display",
  bodyFont: "DM Sans",
  wordmark: "migajas",
} as const;

export const EDITORIAL_SERIES = [
  "la-porcion",
  "leer-la-etiqueta",
  "lo-que-solemos-pensar",
  "migajas-de-confianza",
  "tu-que-harias",
  "dentro-de-migajas",
] as const;

export const CONTENT_MIX = {
  education: 60,
  brand: 20,
  community: 10,
  product: 10,
} as const;

/** Headlines, metadata, captions — not clinical/legal templates. */
export const FORBIDDEN_MARKETING_PATTERNS: readonly RegExp[] = [
  /controla(r)?\s+tu\s+diabetes/i,
  /calcul(a|ar)\s+(la\s+)?insulina/i,
  /ajust(e|ar)\s+(la\s+)?insulina/i,
  /dispositivo\s+m[eé]dico/i,
  /dispositivo\s+sanitario/i,
  /trat(ar|amiento)\s+(la\s+)?diabetes/i,
  /cura(r)?\s+(la\s+)?diabetes/i,
  /revoluciona/i,
  /disruptiv/i,
  /ia\s+que\s+cambia/i,
  /soluci[oó]n\s+definitiva/i,
  /la\s+mejor\s+app/i,
  /antes\s+de\s+que\s+sea\s+tarde/i,
  /nunca\s+vuelvas\s+a\s+equivocarte/i,
  /domina(r)?\s+los\s+carbohidratos/i,
];

export function findForbiddenMarketingPhrases(text: string): string[] {
  return FORBIDDEN_MARKETING_PATTERNS.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source,
  );
}

/** App surfaces guarded by brand-positioning tests. */
export const ACTIVE_BRAND_SOURCES = [
  "src/components/home/HomeAnimated.tsx",
  "src/app/layout.tsx",
  "src/app/opengraph-image.tsx",
] as const;

export const BRAND_DOC_FILES = [
  "docs/BRAND_EDITORIAL_SYSTEM.md",
  "docs/BRAND_CANVA_TEMPLATES_v0.1.md",
] as const;

export const CONTENT_LIBRARY_FILES = [
  "docs/content-library/confidence.md",
  "docs/content-library/the-portion.md",
  "docs/content-library/common-mistakes.md",
  "docs/content-library/questions.md",
  "docs/content-library/batch-01-instagram.md",
] as const;
