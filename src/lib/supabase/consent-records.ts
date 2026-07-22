import type { CookieConsentValue } from "@/lib/domain/cookie-consent";
import {
  buildCookiePreferencesGrant,
  buildHealthDataGrant,
  parseConsentRecordRow,
  type ConsentGrantInput,
  type ConsentRecord,
} from "@/lib/domain/consent-records";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

async function insertConsentGrant(
  userId: string,
  grant: ConsentGrantInput,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("user_consents").insert({
    user_id: userId,
    consent_type: grant.consent_type,
    legal_version: grant.legal_version,
    metadata: grant.metadata ?? {},
  });

  return !error;
}

async function revokeActiveConsents(
  userId: string,
  consentType: ConsentRecord["consent_type"],
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_consents")
    .select("id")
    .eq("user_id", userId)
    .eq("consent_type", consentType)
    .is("revoked_at", null);

  if (error) return false;
  if (!data?.length) return true;

  const revokedAt = new Date().toISOString();
  for (const row of data) {
    const { error: updateError } = await supabase
      .from("user_consents")
      .update({ revoked_at: revokedAt })
      .eq("id", row.id)
      .eq("user_id", userId);
    if (updateError) return false;
  }

  return true;
}

export async function listUserConsents(
  userId: string,
): Promise<ConsentRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_consents")
    .select(
      "id, user_id, consent_type, legal_version, granted_at, revoked_at, metadata",
    )
    .eq("user_id", userId)
    .order("granted_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => parseConsentRecordRow(row))
    .filter((row): row is ConsentRecord => row !== null);
}

export async function grantHealthDataConsent(userId: string): Promise<boolean> {
  await revokeActiveConsents(userId, "health_data");
  return insertConsentGrant(userId, buildHealthDataGrant());
}

export async function revokeHealthDataConsent(userId: string): Promise<boolean> {
  return revokeActiveConsents(userId, "health_data");
}

export async function grantCookiePreferences(
  userId: string,
  preference: CookieConsentValue,
): Promise<boolean> {
  await revokeActiveConsents(userId, "cookie_preferences");
  return insertConsentGrant(userId, buildCookiePreferencesGrant(preference));
}
