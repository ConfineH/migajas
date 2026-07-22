import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetAuthUser = vi.fn();
const mockGetUserProfile = vi.fn();
const mockSyncGuestProfile = vi.fn();
const mockResolveProgress = vi.fn();

vi.mock("@/lib/supabase/auth", () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
}));

vi.mock("@/lib/supabase/user-profile", () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
}));

vi.mock("@/lib/profile-sync", () => ({
  syncGuestProfile: (...args: unknown[]) => mockSyncGuestProfile(...args),
}));

vi.mock("@/lib/learning-state", () => ({
  resolveProgress: (...args: unknown[]) => mockResolveProgress(...args),
}));

import { requireClinicalAccess } from "@/lib/clinical-access";

const authenticatedUser = {
  id: "user-1",
  email: "learner@example.com",
};

const clinicalProfile = {
  user_id: "user-1",
  region_id: "es" as const,
  daily_carb_goal_g: 180,
  clinical_mode_enabled: true,
};

const nivel3Progress = {
  completedLessons: [],
  completedPracticeSteps: [],
  freeModeUnlocked: false,
  completions: [
    {
      levelId: "nivel-3",
      masteryScore: 80,
      correctCount: 4,
      totalCount: 5,
      completedAt: "2026-07-01T10:00:00Z",
      passed: true,
    },
  ],
};

describe("requireClinicalAccess", () => {
  const originalClinicalFlag = process.env.CLINICAL_MODE_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLINICAL_MODE_ENABLED = "true";
    mockSyncGuestProfile.mockResolvedValue(null);
    mockResolveProgress.mockResolvedValue(nivel3Progress);
  });

  afterEach(() => {
    if (originalClinicalFlag === undefined) {
      delete process.env.CLINICAL_MODE_ENABLED;
    } else {
      process.env.CLINICAL_MODE_ENABLED = originalClinicalFlag;
    }
  });

  it("returns 401 when there is no session user", async () => {
    mockGetAuthUser.mockResolvedValue(null);

    const result = await requireClinicalAccess();

    expect(result).toEqual({
      ok: false,
      status: 401,
      error: "Inicia sesión para usar el diario.",
      reason: "auth",
    });
  });

  it("returns 403 when clinical feature flag is disabled", async () => {
    process.env.CLINICAL_MODE_ENABLED = "false";
    mockGetAuthUser.mockResolvedValue(authenticatedUser);

    const result = await requireClinicalAccess();

    expect(result).toEqual({
      ok: false,
      status: 403,
      error: "El seguimiento personal no está disponible.",
      reason: "feature",
    });
  });

  it("returns 403 when nivel 3 is not completed", async () => {
    mockGetAuthUser.mockResolvedValue(authenticatedUser);
    mockGetUserProfile.mockResolvedValue(clinicalProfile);
    mockResolveProgress.mockResolvedValue({
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      completions: [],
    });

    const result = await requireClinicalAccess();

    expect(result).toEqual({
      ok: false,
      status: 403,
      error: "Completa el nivel 3 para usar el diario.",
      reason: "nivel",
    });
  });

  it("returns ok when user passed gates and opted in", async () => {
    mockGetAuthUser.mockResolvedValue(authenticatedUser);
    mockGetUserProfile.mockResolvedValue(clinicalProfile);

    const result = await requireClinicalAccess();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual(authenticatedUser);
      expect(result.profile).toEqual(clinicalProfile);
    }
  });
});
