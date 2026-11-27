import { describe, expect, it } from "vitest";
import { POST as lookup } from "@/app/api/professional/lookup/route";
import { PATCH, POST as share } from "@/app/api/professional/shares/route";
import { CLINICAL_SUSPENSION_ERRORS } from "@/lib/domain/user-profile";
import {
  lookupProfessionalByShareCode,
  shareReportWithProfessional,
  updatePatientRecipientContact,
} from "@/lib/supabase/professional";

describe("suspended professional sharing", () => {
  it("rejects a new share before reading a session or the diary", async () => {
    const response = await share(
      new Request("http://localhost/api/professional/shares", { method: "POST" }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: CLINICAL_SUSPENSION_ERRORS.shareSend,
    });
  });

  it("rejects a share-code lookup before reading a session", async () => {
    const response = await lookup(
      new Request("http://localhost/api/professional/lookup", { method: "POST" }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: CLINICAL_SUSPENSION_ERRORS.shareLookup,
    });
  });

  it("rejects a contact update before reading a session", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/professional/shares", { method: "PATCH" }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: CLINICAL_SUSPENSION_ERRORS.shareSend,
    });
  });

  it("does not call Supabase from the suspended library helpers", async () => {
    await expect(
      shareReportWithProfessional({
        shareCode: "AAAAAA",
        rangeFrom: "2026-01-01",
        rangeTo: "2026-01-07",
        snapshot: {
          from: "2026-01-01",
          to: "2026-01-07",
          goalG: 150,
          days: [],
          rollups: [],
          topFoods: [],
        },
      }),
    ).resolves.toEqual({ error: "El envío de informes no está disponible." });

    await expect(lookupProfessionalByShareCode("AAAAAA")).resolves.toEqual({
      error: "La comprobación de códigos profesionales no está disponible.",
    });

    await expect(
      updatePatientRecipientContact({
        patientUserId: "11111111-1111-4111-8111-111111111111",
        professionalUserId: "22222222-2222-4222-8222-222222222222",
        label: "nutricion",
      }),
    ).resolves.toBe(false);
  });
});
