import { describe, expect, it } from "vitest";
import {
  generateProfessionalShareCode,
  isProfessionalRoleId,
  normalizeShareCode,
  professionalRoleLabel,
  formatShareRecipientPreview,
  parseProfessionalSharePreview,
  validateProfessionalActivation,
  validateProfessionalContact,
  validateShareConfirmation,
} from "@/lib/domain/professional-profile";

describe("professional-profile", () => {
  it("accepts known professional roles", () => {
    expect(isProfessionalRoleId("nutricion")).toBe(true);
    expect(isProfessionalRoleId("paciente")).toBe(false);
    expect(professionalRoleLabel("endocrinologia")).toBe("Endocrinología");
  });

  it("generates a six-character share code from the safe alphabet", () => {
    let cursor = 0;
    const code = generateProfessionalShareCode(() => {
      const value = cursor;
      cursor += 1;
      return value;
    });
    expect(code).toBe("ABCDEF");
    expect(normalizeShareCode("ab-cd ef")).toBe("ABCDEF");
    expect(normalizeShareCode("ABCDEF")).toBe("ABCDEF");
    expect(normalizeShareCode("ABCDE")).toBeNull();
  });

  it("requires a role to activate the professional profile", () => {
    expect(validateProfessionalActivation({}).ok).toBe(false);
    expect(
      validateProfessionalActivation({ professional_role: "nutricion" }),
    ).toEqual({ ok: true, role: "nutricion" });
  });

  it("validates contact messages", () => {
    expect(
      validateProfessionalContact({ subject: "Duda", body: "corto" }).ok,
    ).toBe(false);
    const ok = validateProfessionalContact({
      subject: "Catálogo de República Dominicana",
      body: "Quisiera revisar si el moro está bien estimado en el nivel 4.",
    });
    expect(ok.ok).toBe(true);
  });

  it("describes the share recipient before sending", () => {
    expect(validateShareConfirmation({}).ok).toBe(false);
    expect(validateShareConfirmation({ confirm: true })).toEqual({ ok: true });
    const named = parseProfessionalSharePreview(
      { role: "nutricion", display_name: "Ana Pérez" },
      "AB12CD",
    );
    expect(formatShareRecipientPreview(named!)).toBe(
      "Vas a enviar el informe a Ana Pérez (Nutrición clínica).",
    );
    const anonymous = parseProfessionalSharePreview(
      { role: "endocrinologia", display_name: null },
      "XY34ZT",
    );
    expect(formatShareRecipientPreview(anonymous!)).toContain("endocrinología");
    expect(formatShareRecipientPreview(anonymous!)).toContain("XY34ZT");
  });
});
