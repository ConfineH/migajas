import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockGrantCookiePreferences = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
  })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/lib/supabase/consent-records", () => ({
  grantCookiePreferences: (...args: unknown[]) =>
    mockGrantCookiePreferences(...args),
}));

import { POST as cookieConsentPost } from "@/app/api/cookie-consent/route";

describe("cookie consent API records", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGrantCookiePreferences.mockResolvedValue(true);
  });

  it("records cookie preference for authenticated users", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const response = await cookieConsentPost(
      new Request("http://localhost/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "accepted" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockGrantCookiePreferences).toHaveBeenCalledWith(
      "user-1",
      "accepted",
    );
  });

  it("skips DB record for guests", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await cookieConsentPost(
      new Request("http://localhost/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "essential" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockGrantCookiePreferences).not.toHaveBeenCalled();
  });
});
