export const PROFESSIONAL_ROLES = [
  {
    id: "endocrinologia",
    label: "Endocrinología",
  },
  {
    id: "nutricion",
    label: "Nutrición clínica",
  },
  {
    id: "medicina_familia",
    label: "Medicina de familia o de cabecera",
  },
  {
    id: "educacion_diabetes",
    label: "Enfermería o educación diabetológica",
  },
  {
    id: "otro",
    label: "Otro profesional de la salud",
  },
] as const;

export type ProfessionalRoleId = (typeof PROFESSIONAL_ROLES)[number]["id"];

export const SHARE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SHARE_CODE_LENGTH = 6;
export const CONTACT_SUBJECT_MAX = 120;
export const CONTACT_BODY_MIN = 20;
export const CONTACT_BODY_MAX = 2000;

export function isProfessionalRoleId(
  value: unknown,
): value is ProfessionalRoleId {
  return (
    typeof value === "string" &&
    PROFESSIONAL_ROLES.some((role) => role.id === value)
  );
}

export function professionalRoleLabel(roleId: string | null): string | null {
  if (!roleId) return null;
  return PROFESSIONAL_ROLES.find((role) => role.id === roleId)?.label ?? null;
}

export interface ProfessionalSharePreview {
  role: string;
  displayName: string | null;
  code: string;
}

export function parseProfessionalSharePreview(
  payload: unknown,
  code: string,
): ProfessionalSharePreview | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as { role?: unknown; display_name?: unknown };
  if (typeof row.role !== "string" || !isProfessionalRoleId(row.role)) {
    return null;
  }
  const displayName =
    typeof row.display_name === "string" && row.display_name.trim()
      ? row.display_name.trim().slice(0, 80)
      : null;
  return { role: row.role, displayName, code };
}

export function formatShareRecipientPreview(
  preview: ProfessionalSharePreview,
): string {
  const role = professionalRoleLabel(preview.role) ?? "salud";
  if (preview.displayName) {
    return `Vas a enviar el informe a ${preview.displayName} (${role}).`;
  }
  return `Vas a enviar el informe a un profesional de ${role.toLowerCase()} (código ${preview.code}).`;
}

export function validateShareConfirmation(input: {
  confirm?: unknown;
}): { ok: true } | { ok: false; error: string } {
  if (input.confirm !== true) {
    return {
      ok: false,
      error: "Confirma el destinatario antes de enviar el informe.",
    };
  }
  return { ok: true };
}

export function generateProfessionalShareCode(
  pick: (maxExclusive: number) => number = (maxExclusive) =>
    Math.floor(Math.random() * maxExclusive),
): string {
  let code = "";
  for (let index = 0; index < SHARE_CODE_LENGTH; index += 1) {
    const alphabetIndex = pick(SHARE_CODE_ALPHABET.length);
    code += SHARE_CODE_ALPHABET[alphabetIndex] ?? SHARE_CODE_ALPHABET[0];
  }
  return code;
}

export function normalizeShareCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!new RegExp(`^[${SHARE_CODE_ALPHABET}]{${SHARE_CODE_LENGTH}}$`).test(normalized)) {
    return null;
  }
  return normalized;
}

export function validateProfessionalActivation(input: {
  professional_role?: unknown;
}): { ok: true; role: ProfessionalRoleId } | { ok: false; error: string } {
  if (!isProfessionalRoleId(input.professional_role)) {
    return {
      ok: false,
      error: "Elige tu ámbito profesional.",
    };
  }
  return { ok: true, role: input.professional_role };
}

export function validateProfessionalContact(input: {
  subject?: unknown;
  body?: unknown;
}):
  | { ok: true; subject: string; body: string }
  | { ok: false; error: string } {
  const subject =
    typeof input.subject === "string" ? input.subject.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";

  if (!subject || subject.length > CONTACT_SUBJECT_MAX) {
    return {
      ok: false,
      error: `El asunto debe tener entre 1 y ${CONTACT_SUBJECT_MAX} caracteres.`,
    };
  }
  if (body.length < CONTACT_BODY_MIN || body.length > CONTACT_BODY_MAX) {
    return {
      ok: false,
      error: `El mensaje debe tener entre ${CONTACT_BODY_MIN} y ${CONTACT_BODY_MAX} caracteres.`,
    };
  }
  return { ok: true, subject, body };
}

export const PROFESSIONAL_CONTENT_LINKS = [
  {
    href: "/learn",
    title: "Curso guiado",
    body: "Los cinco niveles, con lecciones, práctica y examen.",
  },
  {
    href: "/guia",
    title: "Guía de referencia",
    body: "Regla de la ración, conversión y fuentes.",
  },
] as const;
