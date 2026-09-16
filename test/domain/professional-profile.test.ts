import { describe, expect, it } from "vitest";
import {
  generateProfessionalShareCode,
  isProfessionalRoleId,
  normalizeShareCode,
  professionalRoleLabel,
  isRecipientSendDue,
  parseRepeatMode,
  patientRecipientLabel,
  formatShareRecipientPreview,
  formatRecipientListLabel,
  normalizeProfessionalUserId,
  parsePatientShareRecipients,
  parseProfessionalSharePreview,
  recipientResendPreview,
  sortDiaryRecipients,
  validateProfessionalActivation,
  validateProfessionalContact,
  validateRecipientLabel,
  validateRecipientPatch,
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
      "Vas a enviar el informe a Ana Pérez (Nutricionista).",
    );
    const anonymous = parseProfessionalSharePreview(
      { role: "endocrinologia", display_name: null },
      "XY34ZT",
    );
    expect(formatShareRecipientPreview(anonymous!)).toContain("Endocrino/a");
    expect(formatShareRecipientPreview(anonymous!)).toContain("XY34ZT");
  });

  it("lists people who currently hold copies", () => {
    expect(normalizeProfessionalUserId("not-a-uuid")).toBeNull();
    const professionalUserId = "11111111-1111-4111-8111-111111111111";
    const recipients = parsePatientShareRecipients([
      {
        professional_user_id: professionalUserId,
        share_code: "AB23CD",
        role: "nutricion",
        label: "nutricion",
        display_name: "Ana Pérez",
        last_sent_at: "2026-09-16T12:00:00.000Z",
        share_count: 2,
      },
      { professional_user_id: "bad" },
    ]);
    expect(recipients).toHaveLength(1);
    expect(formatRecipientListLabel(recipients[0])).toBe("Ana Pérez");
    expect(patientRecipientLabel(recipients[0].label)).toBe("Nutricionista");
    expect(recipientResendPreview(recipients[0])).toContain("Ana Pérez");
    expect(
      validateRecipientLabel({
        professional_user_id: professionalUserId,
        label: "medicina_familia",
      }),
    ).toEqual({
      ok: true,
      professionalUserId,
      label: "medicina_familia",
    });
    expect(
      validateRecipientLabel({
        professional_user_id: professionalUserId,
        label: "cardiologo",
      }).ok,
    ).toBe(false);
  });

  it("reminds next month or every month without sending alone", () => {
    expect(parseRepeatMode("monthly")).toBe("monthly");
    expect(parseRepeatMode("weekly")).toBeNull();
    const professionalUserId = "11111111-1111-4111-8111-111111111111";
    const now = new Date("2026-10-16T12:00:00.000Z");
    expect(isRecipientSendDue("2026-10-16T12:00:00.000Z", now)).toBe(true);
    expect(isRecipientSendDue("2026-10-17T12:00:00.000Z", now)).toBe(false);
    expect(isRecipientSendDue(null, now)).toBe(false);
    expect(
      validateRecipientPatch({
        professional_user_id: professionalUserId,
        repeat_mode: "next_month",
      }),
    ).toEqual({
      ok: true,
      professionalUserId,
      repeatMode: "next_month",
    });
    const due = parsePatientShareRecipients([
      {
        professional_user_id: professionalUserId,
        share_code: "AB23CD",
        role: "nutricion",
        label: "nutricion",
        display_name: "Ana Pérez",
        last_sent_at: "2026-09-01T12:00:00.000Z",
        share_count: 1,
        repeat_mode: "monthly",
        repeat_due_at: "2026-10-01T12:00:00.000Z",
      },
      {
        professional_user_id: "22222222-2222-4222-8222-222222222222",
        share_code: "CD45EF",
        role: "endocrinologia",
        label: "endocrinologia",
        display_name: "Luis",
        last_sent_at: "2026-09-28T12:00:00.000Z",
        share_count: 1,
        repeat_mode: "next_month",
        repeat_due_at: "2026-10-28T12:00:00.000Z",
      },
    ]);
    expect(sortDiaryRecipients(due, now).map((row) => row.displayName)).toEqual(
      ["Ana Pérez", "Luis"],
    );
  });
});
