import { describe, it, expect } from "vitest";
import {
  hasActiveConsent,
  buildConsentGrant,
  type ConsentRecord,
} from "@/lib/domain/consent-records";
import {
  LEGAL_VERSIONS,
  getCookieInventory,
} from "@/lib/domain/legal-versions";

function record(
  overrides: Partial<ConsentRecord> & Pick<ConsentRecord, "consent_type">,
): ConsentRecord {
  return {
    id: "rec-1",
    user_id: "user-1",
    legal_version: LEGAL_VERSIONS.health_data,
    granted_at: "2026-07-23T10:00:00.000Z",
    revoked_at: null,
    metadata: {},
    ...overrides,
  };
}

describe("consent records domain", () => {
  it("detects active health_data consent", () => {
    const records = [record({ consent_type: "health_data" })];
    expect(hasActiveConsent(records, "health_data")).toBe(true);
  });

  it("treats revoked consent as inactive", () => {
    const records = [
      record({
        consent_type: "health_data",
        revoked_at: "2026-07-23T11:00:00.000Z",
      }),
    ];
    expect(hasActiveConsent(records, "health_data")).toBe(false);
  });

  it("builds grant with current legal version", () => {
    const grant = buildConsentGrant("cookie_preferences", {
      preference: "accepted",
    });
    expect(grant.consent_type).toBe("cookie_preferences");
    expect(grant.legal_version).toBe(LEGAL_VERSIONS.cookie_notice);
    expect(grant.metadata).toEqual({ preference: "accepted" });
  });

  it("lists cookie inventory with required fields", () => {
    const inventory = getCookieInventory();
    expect(inventory.length).toBeGreaterThan(0);
    for (const item of inventory) {
      expect(item.name).toBeTruthy();
      expect(item.purpose).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.duration).toBeTruthy();
    }
  });
});
