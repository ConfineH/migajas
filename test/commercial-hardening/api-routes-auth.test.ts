import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireClinicalAccess = vi.fn();
const mockRequireContentAdmin = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/clinical-access", () => ({
  requireClinicalAccess: (...args: unknown[]) =>
    mockRequireClinicalAccess(...args),
}));

vi.mock("@/lib/supabase/content-admin", () => ({
  requireContentAdmin: (...args: unknown[]) =>
    mockRequireContentAdmin(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

import { GET as exportGet } from "@/app/api/clinical/export/route";
import {
  GET as intakeGet,
  POST as intakePost,
  PATCH as intakePatch,
  DELETE as intakeDelete,
} from "@/app/api/intake/route";
import { GET as adminMetricsGet } from "@/app/api/admin/metrics/route";
import { GET as profileGet, PATCH as profilePatch } from "@/app/api/profile/route";

const denied403 = {
  ok: false,
  status: 403,
  error: "Activa el seguimiento personal en Configuración.",
  reason: "opt-in",
} as const;

const unauthenticated401 = {
  ok: false,
  status: 401,
  error: "Inicia sesión para usar el diario.",
  reason: "auth",
} as const;

describe("clinical API auth gates", () => {
  beforeEach(() => {
    mockRequireClinicalAccess.mockReset();
  });

  it("export returns 401 when unauthenticated", async () => {
    mockRequireClinicalAccess.mockResolvedValue(unauthenticated401);

    const response = await exportGet(
      new Request("http://localhost/api/clinical/export?format=csv&range=7d"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: unauthenticated401.error,
    });
  });

  it("export returns 403 when clinical access denied", async () => {
    mockRequireClinicalAccess.mockResolvedValue({
      ok: false,
      status: 403,
      error: "Completa el nivel 3 para usar el diario.",
      reason: "nivel",
    });

    const response = await exportGet(
      new Request("http://localhost/api/clinical/export?format=pdf&range=7d"),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Completa el nivel 3 para usar el diario.",
    });
  });

  it("intake GET returns 401 when unauthenticated", async () => {
    mockRequireClinicalAccess.mockResolvedValue(unauthenticated401);

    const response = await intakeGet(
      new Request("http://localhost/api/intake?local_date=2026-07-14"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: unauthenticated401.error,
    });
  });

  it("intake POST returns 403 when clinical access denied", async () => {
    mockRequireClinicalAccess.mockResolvedValue(denied403);

    const response = await intakePost(
      new Request("http://localhost/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_id: "manzana",
          meal_slot: "desayuno",
          local_date: "2026-07-14",
          portion_multiplier: 1,
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: denied403.error });
  });

  it("intake PATCH returns 403 when clinical access denied", async () => {
    mockRequireClinicalAccess.mockResolvedValue(denied403);

    const response = await intakePatch(
      new Request("http://localhost/api/intake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "entry-1",
          local_date: "2026-07-14",
          portion_multiplier: 2,
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: denied403.error });
  });

  it("intake DELETE returns 403 when clinical access denied", async () => {
    mockRequireClinicalAccess.mockResolvedValue(denied403);

    const response = await intakeDelete(
      new Request(
        "http://localhost/api/intake?id=entry-1&local_date=2026-07-14",
        { method: "DELETE" },
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: denied403.error });
  });
});

describe("profile API auth gates", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
  });

  it("GET returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await profileGet();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autenticado" });
  });

  it("PATCH returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await profilePatch(
      new Request("http://localhost/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinical_mode_enabled: true }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autenticado" });
  });
});

describe("admin metrics API auth gates", () => {
  beforeEach(() => {
    mockRequireContentAdmin.mockReset();
  });

  it("returns 403 when caller is not a content admin", async () => {
    mockRequireContentAdmin.mockRejectedValue(new Error("FORBIDDEN"));

    const response = await adminMetricsGet();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "No autorizado",
    });
  });

  it("returns 503 when service role is not configured", async () => {
    mockRequireContentAdmin.mockRejectedValue(new Error("SERVICE_ROLE_MISSING"));

    const response = await adminMetricsGet();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    });
  });
});
