import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockRevokeHealthDataConsent = vi.fn();
const mockGetUserProfile = vi.fn();
const mockPatchUserProfile = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/supabase/consent-records", () => ({
  revokeHealthDataConsent: (...args: unknown[]) =>
    mockRevokeHealthDataConsent(...args),
}));

vi.mock("@/lib/supabase/user-profile", () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  patchUserProfile: (...args: unknown[]) => mockPatchUserProfile(...args),
}));

import { POST as revokePost } from "@/app/api/consent/revoke-health-data/route";

describe("revoke health data consent API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await revokePost();

    expect(response.status).toBe(401);
  });

  it("revokes consent and disables clinical mode", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockGetUserProfile.mockResolvedValue({
      user_id: "user-1",
      region_id: "es",
      daily_carb_goal_g: 180,
      clinical_mode_enabled: true,
    });
    mockRevokeHealthDataConsent.mockResolvedValue(true);
    mockPatchUserProfile.mockResolvedValue({
      user_id: "user-1",
      region_id: "es",
      daily_carb_goal_g: 180,
      clinical_mode_enabled: false,
    });

    const response = await revokePost();

    expect(response.status).toBe(200);
    expect(mockRevokeHealthDataConsent).toHaveBeenCalledWith("user-1");
    expect(mockPatchUserProfile).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ clinical_mode_enabled: true }),
      { clinical_mode_enabled: false },
    );
    await expect(response.json()).resolves.toEqual({
      ok: true,
      clinical_mode_enabled: false,
    });
  });
});
