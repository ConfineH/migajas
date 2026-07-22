export const LEGAL_VERSIONS = {
  privacy_policy: "2026-07-23",
  cookie_notice: "2026-07-23",
  terms_of_service: "2026-07-23",
  health_data: "2026-07-23",
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_VERSIONS;

export interface CookieInventoryItem {
  name: string;
  owner: string;
  purpose: string;
  category: "esencial" | "preferencia";
  duration: string;
}

export function getCookieInventory(): CookieInventoryItem[] {
  return [
    {
      name: "migajas_onboarding",
      owner: "Migajas",
      purpose: "Preferencias de región, meta diaria y modo invitado",
      category: "esencial",
      duration: "12 meses",
    },
    {
      name: "migajas_progress",
      owner: "Migajas",
      purpose: "Progreso del curso e intentos de práctica",
      category: "esencial",
      duration: "12 meses",
    },
    {
      name: "migajas_attempts",
      owner: "Migajas",
      purpose: "Historial de intentos en modo invitado",
      category: "esencial",
      duration: "12 meses",
    },
    {
      name: "migajas_cookie_consent",
      owner: "Migajas",
      purpose: "Registro de la decisión del banner de cookies",
      category: "preferencia",
      duration: "12 meses",
    },
    {
      name: "Cookies de sesión Supabase Auth",
      owner: "Supabase (procesador)",
      purpose: "Autenticación y sesión de usuario",
      category: "esencial",
      duration: "Sesión / renovación automática",
    },
  ];
}

export function legalVersionForConsentType(
  consentType: "health_data" | "cookie_preferences" | "privacy_policy",
): string {
  switch (consentType) {
    case "health_data":
      return LEGAL_VERSIONS.health_data;
    case "cookie_preferences":
      return LEGAL_VERSIONS.cookie_notice;
    case "privacy_policy":
      return LEGAL_VERSIONS.privacy_policy;
  }
}
