import { describe, it, expect } from "vitest";
import { validateProfilePatch } from "@/lib/domain/user-profile";

describe("clinical health data consent", () => {
  it("requires explicit consent when enabling clinical mode", () => {
    const result = validateProfilePatch({
      clinical_mode_enabled: true,
      health_data_consent: false,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("consentimiento");
    }
  });

  it("allows enabling clinical mode with explicit consent", () => {
    const result = validateProfilePatch({
      clinical_mode_enabled: true,
      health_data_consent: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.clinical_mode_enabled).toBe(true);
    }
  });
});
