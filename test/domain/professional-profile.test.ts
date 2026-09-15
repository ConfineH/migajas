import { describe, expect, it } from "vitest";
import {
  generateProfessionalShareCode,
  isProfessionalRoleId,
  normalizeShareCode,
  professionalRoleLabel,
  validateProfessionalActivation,
  validateProfessionalContact,
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
});
