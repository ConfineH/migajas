import { describe, it, expect } from "vitest";
import { parseOrgDashboardStats } from "@/lib/domain/admin-metrics";

const samplePayload = {
  total_users: 120,
  active_7d: 55,
  active_30d: 45,
  avg_levels_passed: 2.4,
  funnel: {
    lesson_starters: 90,
    nivel1_passed: 40,
    nivel2_passed: 30,
    nivel3_passed: 20,
    nivel4_passed: 12,
    nivel5_passed: 8,
    free_mode_unlocked: 35,
  },
  regions: {
    es: 80,
    do: 25,
    unknown: 15,
  },
  clinical: {
    profiles_count: 105,
    enabled_count: 18,
    enabled_pct: 17.1,
  },
  diary_active_30d: 12,
  retention: {
    retention_7d_pct: 42.5,
    retention_30d_pct: 31.2,
  },
  consents: {
    by_type: [
      { consent_type: "health_data", active_grants: 18, revoked: 2 },
      { consent_type: "privacy_policy", active_grants: 100, revoked: 0 },
    ],
    by_version: [
      {
        consent_type: "health_data",
        legal_version: "2026-07-01",
        active_grants: 18,
      },
    ],
  },
};

describe("parseOrgDashboardStats", () => {
  it("parses aggregate metrics without PII fields", () => {
    const stats = parseOrgDashboardStats(samplePayload);

    expect(stats).toEqual({
      totalUsers: 120,
      active7d: 55,
      active30d: 45,
      avgLevelsPassed: 2.4,
      funnel: {
        lessonStarters: 90,
        nivel1Passed: 40,
        nivel2Passed: 30,
        nivel3Passed: 20,
        nivel4Passed: 12,
        nivel5Passed: 8,
        freeModeUnlocked: 35,
      },
      regions: { es: 80, do: 25, unknown: 15 },
      clinical: {
        profilesCount: 105,
        enabledCount: 18,
        enabledPct: 17.1,
      },
      diaryActive30d: 12,
      retention: {
        retention7dPct: 42.5,
        retention30dPct: 31.2,
      },
      consents: {
        byType: [
          { consentType: "health_data", activeGrants: 18, revoked: 2 },
          { consentType: "privacy_policy", activeGrants: 100, revoked: 0 },
        ],
        byVersion: [
          {
            consentType: "health_data",
            legalVersion: "2026-07-01",
            activeGrants: 18,
          },
        ],
      },
    });
    expect(stats).not.toHaveProperty("user_id");
    expect(stats).not.toHaveProperty("email");
  });

  it("returns null for invalid payloads", () => {
    expect(parseOrgDashboardStats(null)).toBeNull();
    expect(parseOrgDashboardStats({ total_users: "x" })).toBeNull();
  });
});
