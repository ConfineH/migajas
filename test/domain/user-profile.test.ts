import { describe, it, expect } from "vitest";
import {
  mergeCookieIntoProfile,
  validateDailyCarbGoal,
  validateProfilePatch,
  type UserProfile,
} from "@/lib/domain/user-profile";
import type { OnboardingState } from "@/lib/onboarding";

describe("mergeCookieIntoProfile", () => {
  const cookie: OnboardingState = {
    regionId: "do",
    guestMode: false,
    completed: true,
    daily_carb_goal_g: 180,
  };

  it("inherits cookie region and goal on first login", () => {
    const merged = mergeCookieIntoProfile(cookie);
    expect(merged).toEqual({
      region_id: "do",
      daily_carb_goal_g: 180,
      clinical_mode_enabled: false,
    });
  });

  it("keeps existing profile goal over stale cookie", () => {
    const existing: UserProfile = {
      user_id: "user-1",
      region_id: "es",
      daily_carb_goal_g: 200,
      clinical_mode_enabled: false,
    };
    const staleCookie: OnboardingState = {
      ...cookie,
      daily_carb_goal_g: 150,
    };
    const merged = mergeCookieIntoProfile(staleCookie, existing);
    expect(merged.daily_carb_goal_g).toBe(200);
    expect(merged.region_id).toBe("es");
  });

  it("defaults clinical mode to false for new profiles", () => {
    expect(mergeCookieIntoProfile(cookie).clinical_mode_enabled).toBe(false);
  });
});

describe("validateDailyCarbGoal", () => {
  it("accepts positive integers", () => {
    expect(validateDailyCarbGoal(160)).toBeNull();
  });

  it("accepts null to clear goal", () => {
    expect(validateDailyCarbGoal(null)).toBeNull();
  });

  it("rejects zero", () => {
    expect(validateDailyCarbGoal(0)).not.toBeNull();
  });
});

describe("validateProfilePatch", () => {
  it("rejects invalid daily carb goal", () => {
    const result = validateProfilePatch({ daily_carb_goal_g: 0 });
    expect(result.ok).toBe(false);
  });

  it("accepts valid patch fields", () => {
    const result = validateProfilePatch({
      region_id: "do",
      daily_carb_goal_g: 160,
      clinical_mode_enabled: true,
      health_data_consent: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        region_id: "do",
        daily_carb_goal_g: 160,
        clinical_mode_enabled: true,
      });
    }
  });
});
