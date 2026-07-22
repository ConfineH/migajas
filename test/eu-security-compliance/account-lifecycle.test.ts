import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockExportData = vi.fn();
const mockDeleteData = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  })),
}));

vi.mock("@/lib/supabase/account-lifecycle", () => ({
  exportAuthenticatedUserData: (...args: unknown[]) => mockExportData(...args),
  deleteAuthenticatedUserData: (...args: unknown[]) => mockDeleteData(...args),
}));

import { GET as exportGet } from "@/app/api/account/export/route";
import { DELETE as accountDelete } from "@/app/api/account/delete/route";

describe("account lifecycle APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it("export returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await exportGet();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autenticado" });
  });

  it("export returns user data when authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockExportData.mockResolvedValue({
      account: { user_id: "user-1", email: "user@example.com" },
      profile: { user_id: "user-1" },
      learning_state: null,
      intake_entries: [],
      learning_events: [],
      consents: [],
    });

    const response = await exportGet();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      account: { user_id: "user-1", email: "user@example.com" },
      profile: { user_id: "user-1" },
      learning_state: null,
      intake_entries: [],
      learning_events: [],
      consents: [],
    });
  });

  it("delete returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await accountDelete();

    expect(response.status).toBe(401);
  });

  it("delete removes account when authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockDeleteData.mockResolvedValue(true);

    const response = await accountDelete();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mockDeleteData).toHaveBeenCalledWith("user-1");
    expect(mockSignOut).toHaveBeenCalled();
  });
});
