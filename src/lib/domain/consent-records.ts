import type { CookieConsentValue } from "@/lib/domain/cookie-consent";
import { legalVersionForConsentType } from "@/lib/domain/legal-versions";

export type ConsentType = "health_data" | "cookie_preferences" | "privacy_policy";

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  legal_version: string;
  granted_at: string;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
}

export interface ConsentGrantInput {
  consent_type: ConsentType;
  legal_version: string;
  metadata?: Record<string, unknown>;
}

export function hasActiveConsent(
  records: ConsentRecord[],
  consentType: ConsentType,
): boolean {
  return records.some(
    (record) =>
      record.consent_type === consentType && record.revoked_at === null,
  );
}

export function buildConsentGrant(
  consentType: ConsentType,
  metadata: Record<string, unknown> = {},
): ConsentGrantInput {
  return {
    consent_type: consentType,
    legal_version: legalVersionForConsentType(consentType),
    metadata,
  };
}

export function buildCookiePreferencesGrant(
  preference: CookieConsentValue,
): ConsentGrantInput {
  return buildConsentGrant("cookie_preferences", { preference });
}

export function buildHealthDataGrant(): ConsentGrantInput {
  return buildConsentGrant("health_data");
}

export function buildPrivacyPolicyGrant(): ConsentGrantInput {
  return buildConsentGrant("privacy_policy");
}

export function parseConsentRecordRow(row: {
  id: string;
  user_id: string;
  consent_type: string;
  legal_version: string;
  granted_at: string;
  revoked_at: string | null;
  metadata: Record<string, unknown> | null;
}): ConsentRecord | null {
  if (
    row.consent_type !== "health_data" &&
    row.consent_type !== "cookie_preferences" &&
    row.consent_type !== "privacy_policy"
  ) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    consent_type: row.consent_type,
    legal_version: row.legal_version,
    granted_at: row.granted_at,
    revoked_at: row.revoked_at,
    metadata: row.metadata ?? {},
  };
}
