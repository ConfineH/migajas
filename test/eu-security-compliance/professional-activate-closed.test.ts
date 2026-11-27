import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/professional/activate/route";

describe("POST /api/professional/activate", () => {
  it("returns 403 without reading a session or a profile", async () => {
    const response = await POST();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "El alta profesional no está disponible.",
    });
  });
});
