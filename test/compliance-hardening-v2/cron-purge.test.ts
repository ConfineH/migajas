import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPurgeExpiredIntakeEntries = vi.fn();

vi.mock("@/lib/supabase/intake-retention", () => ({
  purgeExpiredIntakeEntries: (...args: unknown[]) =>
    mockPurgeExpiredIntakeEntries(...args),
}));

import { GET as purgeGet } from "@/app/api/cron/purge-intake/route";

describe("cron purge intake", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    mockPurgeExpiredIntakeEntries.mockResolvedValue({ deleted: 3 });
  });

  it("returns 401 without cron secret", async () => {
    const response = await purgeGet(
      new Request("http://localhost/api/cron/purge-intake"),
    );
    expect(response.status).toBe(401);
  });

  it("purges expired intake when authorized", async () => {
    const response = await purgeGet(
      new Request("http://localhost/api/cron/purge-intake", {
        headers: { Authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(mockPurgeExpiredIntakeEntries).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ ok: true, deleted: 3 });
  });
});
