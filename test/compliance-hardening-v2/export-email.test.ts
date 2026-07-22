import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockExportData = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/supabase/account-lifecycle", () => ({
  exportAuthenticatedUserData: (...args: unknown[]) => mockExportData(...args),
}));

import { GET as exportGet } from "@/app/api/account/export/route";

describe("account export email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes auth email into export payload", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "tony@example.com" } },
      error: null,
    });
    mockExportData.mockResolvedValue({
      account: { user_id: "user-1", email: "tony@example.com" },
      profile: null,
      learning_state: null,
      intake_entries: [],
      learning_events: [],
      consents: [],
    });

    const response = await exportGet();

    expect(response.status).toBe(200);
    expect(mockExportData).toHaveBeenCalledWith("user-1", {
      email: "tony@example.com",
    });
  });
});
