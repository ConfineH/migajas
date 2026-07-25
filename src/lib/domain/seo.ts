import type { Metadata } from "next";
import { getLevels } from "@/lib/domain/exercises";
import { SEO_COPY, findForbiddenMarketingPhrases } from "@/lib/domain/brand-positioning";

const DEFAULT_SITE_URL = "https://migajas.vercel.app";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? DEFAULT_SITE_URL
  );
}

/** Paths blocked in robots.txt (prefix match). */
export const ROBOTS_DISALLOW_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/login",
  "/diario",
  "/analytics",
  "/progress",
  "/inicio",
  "/catalog",
  "/levels",
] as const;

export type PublicPageKey =
  | "home"
  | "onboarding"
  | "learn"
  | "guia"
  | "privacidad"
  | "terminos"
  | "cookies";

export interface PageSeoEntry {
  path: string;
  title: string;
  description: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}

export const PUBLIC_PAGE_SEO: Record<PublicPageKey, PageSeoEntry> = {
  home: {
    path: "/",
    title: SEO_COPY.title,
    description: SEO_COPY.description,
    changeFrequency: "weekly",
    priority: 1,
  },
  onboarding: {
    path: "/onboarding",
    title: "Empezar el curso — Migajas",
    description:
      "Configura tu país y empieza el curso guiado para aprender a contar carbohidratos con comida real, paso a paso.",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  learn: {
    path: "/learn",
    title: "Curso guiado de conteo de carbohidratos — Migajas",
    description:
      "Curso educativo de 5 niveles: lecciones, práctica y exámenes para relacionar gramos, carbohidratos y raciones con alimentos de tu país.",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  guia: {
    path: "/guia",
    title: "Guía de referencia — Migajas",
    description:
      "Reglas de raciones, calculadora y fuentes para consultar el conteo de carbohidratos con comida real de España y República Dominicana.",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  privacidad: {
    path: "/privacidad",
    title: "Privacidad — Migajas",
    description:
      "Política de privacidad de Migajas: herramienta educativa para aprender a contar carbohidratos. Información sobre datos y derechos.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  terminos: {
    path: "/terminos",
    title: "Términos y condiciones — Migajas",
    description:
      "Condiciones de uso de Migajas, aplicación educativa para el aprendizaje del conteo de carbohidratos.",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  cookies: {
    path: "/cookies",
    title: "Política de cookies — Migajas",
    description:
      "Información sobre el uso de cookies en Migajas y cómo gestionar tus preferencias.",
    changeFrequency: "yearly",
    priority: 0.2,
  },
};

export function getLearnLevelSeo(levelId: string): PageSeoEntry | null {
  const level = getLevels().find((entry) => entry.id === levelId);
  if (!level) return null;

  return {
    path: `/learn/${levelId}`,
    title: `${level.name} — Migajas`,
    description: `${level.description} Curso educativo de conteo de carbohidratos con comida real.`,
    changeFrequency: "monthly",
    priority: 0.8,
  };
}

export function getSitemapEntries(): PageSeoEntry[] {
  const levels = getLevels().map((level) => getLearnLevelSeo(level.id)!);
  return [
    PUBLIC_PAGE_SEO.home,
    PUBLIC_PAGE_SEO.onboarding,
    PUBLIC_PAGE_SEO.learn,
    ...levels,
    PUBLIC_PAGE_SEO.guia,
    PUBLIC_PAGE_SEO.privacidad,
    PUBLIC_PAGE_SEO.terminos,
    PUBLIC_PAGE_SEO.cookies,
  ];
}

export function buildPageMetadata(
  entry: Pick<PageSeoEntry, "title" | "description" | "path">,
  options?: { noIndex?: boolean },
): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${entry.path === "/" ? "" : entry.path}`;

  return {
    title: entry.title,
    description: entry.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: canonical,
      locale: "es_ES",
      siteName: "Migajas",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
    robots: options?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const NOINDEX_METADATA = buildPageMetadata(
  {
    title: "Migajas",
    description: SEO_COPY.description,
    path: "/",
  },
  { noIndex: true },
);

export function buildOrganizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Migajas",
    url: siteUrl,
    description: SEO_COPY.description,
    inLanguage: "es",
  };
}

export function buildCourseJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Curso de conteo de carbohidratos",
    description: SEO_COPY.openGraphDescription,
    provider: {
      "@type": "Organization",
      name: "Migajas",
      url: siteUrl,
    },
    inLanguage: "es",
    educationalLevel: "Beginner",
    teaches: "Conteo de carbohidratos con comida real",
    url: `${siteUrl}/learn`,
    isAccessibleForFree: true,
  };
}

export function assertSeoCopySafe(text: string): void {
  const violations = findForbiddenMarketingPhrases(text);
  if (violations.length > 0) {
    throw new Error(`SEO copy contains forbidden phrases: ${violations.join(", ")}`);
  }
}

/** Validate all public SEO descriptions at module load in tests. */
export function validatePublicSeoCopy(): string[] {
  const violations: string[] = [];
  for (const entry of getSitemapEntries()) {
    const found = findForbiddenMarketingPhrases(
      `${entry.title} ${entry.description}`,
    );
    if (found.length > 0) {
      violations.push(`${entry.path}: ${found.join(", ")}`);
    }
  }
  return violations;
}
