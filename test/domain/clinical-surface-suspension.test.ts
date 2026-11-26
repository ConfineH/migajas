import { describe, expect, it } from "vitest";
import {
  CLINICAL_SURFACE_SUSPENDED,
  clinicalSurfacePatchBlock,
  mergeCookieIntoProfile,
} from "@/lib/domain/user-profile";
import type { OnboardingState } from "@/lib/onboarding";

describe("clinical surface suspension", () => {
  const cookie: OnboardingState = {
    regionId: "do",
    guestMode: false,
    completed: true,
    daily_carb_goal_g: 180,
  };

  it("keeps the suspension switch on for this pilot", () => {
    expect(CLINICAL_SURFACE_SUSPENDED).toBe(true);
  });

  it("does not copy a cookie carb goal onto a new profile", () => {
    expect(mergeCookieIntoProfile(cookie)).toEqual({
      region_id: "do",
      daily_carb_goal_g: null,
      clinical_mode_enabled: false,
    });
  });

  it("rejects a profile patch that sets a goal or turns clinical mode on", () => {
    expect(clinicalSurfacePatchBlock({ region_id: "es" })).toBeNull();
    expect(
      clinicalSurfacePatchBlock({ daily_carb_goal_g: 160 }),
    ).toMatch(/suspendida/i);
    expect(
      clinicalSurfacePatchBlock({ clinical_mode_enabled: true }),
    ).toMatch(/suspendida/i);
    expect(
      clinicalSurfacePatchBlock({ clinical_mode_enabled: false }),
    ).toBeNull();
  });
});
