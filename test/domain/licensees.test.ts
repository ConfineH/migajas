import { describe, it, expect } from "vitest";
import {
  parseLicenseeRow,
  validateLicenseeInput,
} from "@/lib/domain/licensees";

describe("licensees domain", () => {
  it("validates licensee input", () => {
    expect(
      validateLicenseeInput({
        name: "Clínica Norte",
        territory: "es",
        contractDate: "2026-01-15",
        supportTier: "standard",
        contactEmail: "contacto@clinica.test",
        notes: "",
      }),
    ).toBeNull();
  });

  it("rejects invalid email", () => {
    expect(
      validateLicenseeInput({
        name: "Clínica Norte",
        territory: "es",
        contractDate: null,
        supportTier: "basic",
        contactEmail: "not-an-email",
        notes: "",
      }),
    ).toBe("Email de contacto inválido");
  });

  it("parses licensee row", () => {
    const licensee = parseLicenseeRow({
      id: "abc",
      name: "Hospital Sur",
      territory: "do",
      contract_date: "2026-02-01",
      support_tier: "premium",
      contact_email: "ventas@hospital.test",
      notes: "Contrato anual",
      created_at: "2026-02-01T00:00:00.000Z",
      updated_at: "2026-02-01T00:00:00.000Z",
    });

    expect(licensee).toEqual({
      id: "abc",
      name: "Hospital Sur",
      territory: "do",
      contractDate: "2026-02-01",
      supportTier: "premium",
      contactEmail: "ventas@hospital.test",
      notes: "Contrato anual",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
  });
});
