import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGrantPrivacyPolicyConsentIfNeeded = vi.fn();

vi.mock("@/lib/supabase/consent-records", () => ({
  grantPrivacyPolicyConsentIfNeeded: (...args: unknown[]) =>
    mockGrantPrivacyPolicyConsentIfNeeded(...args),
}));

vi.mock("@/lib/learning-state", () => ({
  syncGuestLearningState: vi.fn(async () => ({
    progress: {},
    attempts: [],
  })),
  applyLearningStateCookies: vi.fn(),
}));

vi.mock("@/lib/profile-sync", () => ({
  syncGuestProfile: vi.fn(async () => null),
}));

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/domain/lessons", () => ({
  getAllLessons: vi.fn(() => []),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({ error: null })),
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-1", email: "user@example.com" } },
      })),
    },
  })),
}));

import { GET as authCallbackGet } from "@/app/auth/callback/route";

describe("privacy consent on login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGrantPrivacyPolicyConsentIfNeeded.mockResolvedValue(true);
  });

  it("records privacy policy consent after successful OAuth callback", async () => {
    const response = await authCallbackGet(
      new Request("http://localhost/auth/callback?code=abc&next=/learn"),
    );

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(mockGrantPrivacyPolicyConsentIfNeeded).toHaveBeenCalledWith("user-1");
  });
});
