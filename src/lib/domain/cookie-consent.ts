export const COOKIE_CONSENT_COOKIE = "migajas_cookie_consent";

export type CookieConsentValue = "accepted" | "essential";

export function parseCookieConsent(
  value: string | null | undefined,
): CookieConsentValue | null {
  if (value === "accepted" || value === "essential") {
    return value;
  }
  return null;
}

export function hasCookieConsent(
  value: string | null | undefined,
): boolean {
  return parseCookieConsent(value) !== null;
}
