import { describe, it, expect } from "vitest";
import { parseOrgDashboardStats } from "@/lib/domain/admin-metrics";

describe("parseOrgDashboardStats", () => {
  it("parses aggregate metrics without PII fields", () => {
    const stats = parseOrgDashboardStats({
      total_users: 120,
      active_30d: 45,
      avg_levels_passed: 2.4,
      funnel: {
        lesson_starters: 90,
        nivel1_passed: 40,
        free_mode_unlocked: 35,
      },
    });

    expect(stats).toEqual({
      totalUsers: 120,
      active30d: 45,
      avgLevelsPassed: 2.4,
      funnel: {
        lessonStarters: 90,
        nivel1Passed: 40,
        freeModeUnlocked: 35,
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
