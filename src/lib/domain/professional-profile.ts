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

export const PATIENT_RECIPIENT_LABELS = [
  { id: "endocrinologia", label: "Endocrino/a" },
  { id: "medicina_familia", label: "Médico/a de cabecera" },
  { id: "educacion_diabetes", label: "Enfermería" },
  { id: "nutricion", label: "Nutricionista" },
  { id: "otro", label: "Otro" },
] as const;

export type PatientRecipientLabelId = (typeof PATIENT_RECIPIENT_LABELS)[number]["id"];

export const RECIPIENT_REPEAT_MODES = ["next_month", "monthly"] as const;
export type RecipientRepeatMode = (typeof RECIPIENT_REPEAT_MODES)[number];

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

export function isPatientRecipientLabelId(
  value: unknown,
): value is PatientRecipientLabelId {
  return (
    typeof value === "string" &&
    PATIENT_RECIPIENT_LABELS.some((item) => item.id === value)
  );
}

export function patientRecipientLabel(labelId: string | null): string | null {
  if (!labelId) return null;
  return (
    PATIENT_RECIPIENT_LABELS.find((item) => item.id === labelId)?.label ?? null
  );
}

export function parseRepeatMode(value: unknown): RecipientRepeatMode | null {
  if (value === "next_month" || value === "monthly") return value;
  return null;
}

export function addOneMonth(from: Date): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}

export function isRecipientSendDue(
  repeatDueAt: string | null,
  now: Date = new Date(),
): boolean {
  if (!repeatDueAt) return false;
  const dueAt = new Date(repeatDueAt);
  if (Number.isNaN(dueAt.getTime())) return false;
  return now.getTime() >= dueAt.getTime();
}

export function formatRepeatDue(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(date);
}

export function sortDiaryRecipients<T extends PatientShareRecipient>(
  recipients: T[],
  now: Date = new Date(),
): T[] {
  return [...recipients].sort((left, right) => {
    const leftDue = isRecipientSendDue(left.repeatDueAt, now);
    const rightDue = isRecipientSendDue(right.repeatDueAt, now);
    if (leftDue !== rightDue) return leftDue ? -1 : 1;
    const leftTime = left.lastSentAt ? Date.parse(left.lastSentAt) : 0;
    const rightTime = right.lastSentAt ? Date.parse(right.lastSentAt) : 0;
    return rightTime - leftTime;
  });
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
  const role =
    patientRecipientLabel(preview.role) ??
    professionalRoleLabel(preview.role) ??
    "salud";
  if (preview.displayName) {
    return `Vas a enviar el informe a ${preview.displayName} (${role}).`;
  }
  return `Vas a enviar el informe a ${role} (código ${preview.code}).`;
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

export function normalizeProfessionalUserId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim().toLowerCase();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
  ) {
    return null;
  }
  return id;
}

export interface PatientShareRecipient {
  professionalUserId: string;
  shareCode: string | null;
  role: ProfessionalRoleId;
  label: PatientRecipientLabelId;
  displayName: string | null;
  lastSentAt: string | null;
  shareCount: number;
  repeatMode: RecipientRepeatMode | null;
  repeatDueAt: string | null;
}

export function parsePatientShareRecipient(
  payload: unknown,
): PatientShareRecipient | null {
  if (!payload || typeof payload !== "object") return null;
  const row = payload as {
    professional_user_id?: unknown;
    share_code?: unknown;
    role?: unknown;
    label?: unknown;
    display_name?: unknown;
    last_sent_at?: unknown;
    share_count?: unknown;
    repeat_mode?: unknown;
    repeat_due_at?: unknown;
  };
  const professionalUserId = normalizeProfessionalUserId(
    row.professional_user_id,
  );
  const role = isProfessionalRoleId(row.role)
    ? row.role
    : isPatientRecipientLabelId(row.label)
      ? row.label
      : null;
  if (!professionalUserId || !role) return null;
  const label = isPatientRecipientLabelId(row.label) ? row.label : role;
  const lastSentAt =
    typeof row.last_sent_at === "string" && row.last_sent_at.trim()
      ? row.last_sent_at
      : null;
  const rawCount =
    typeof row.share_count === "number"
      ? row.share_count
      : typeof row.share_count === "string"
        ? Number(row.share_count)
        : 0;
  const shareCount =
    Number.isFinite(rawCount) && rawCount >= 0 ? Math.floor(rawCount) : 0;
  const displayName =
    typeof row.display_name === "string" && row.display_name.trim()
      ? row.display_name.trim().slice(0, 80)
      : null;
  const repeatDueAt =
    typeof row.repeat_due_at === "string" && row.repeat_due_at.trim()
      ? row.repeat_due_at
      : null;
  return {
    professionalUserId,
    shareCode: normalizeShareCode(row.share_code),
    role,
    label,
    displayName,
    lastSentAt,
    shareCount,
    repeatMode: parseRepeatMode(row.repeat_mode),
    repeatDueAt,
  };
}

export function parsePatientShareRecipients(
  payload: unknown,
): PatientShareRecipient[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((row) => {
    const parsed = parsePatientShareRecipient(row);
    return parsed ? [parsed] : [];
  });
}

export function formatRecipientListLabel(
  recipient: PatientShareRecipient,
): string {
  const label = patientRecipientLabel(recipient.label) ?? "profesional";
  if (recipient.displayName) {
    return recipient.displayName;
  }
  if (recipient.shareCode) {
    return `${label} · ${recipient.shareCode}`;
  }
  return label;
}

export function formatRecipientLastSent(iso: string | null): string {
  if (!iso) return "Sin copias ahora";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sin copias ahora";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(date);
}

export function recipientResendPreview(
  recipient: PatientShareRecipient,
): string | null {
  if (!recipient.shareCode) return null;
  return formatShareRecipientPreview({
    role: recipient.label,
    displayName: recipient.displayName,
    code: recipient.shareCode,
  });
}

export function validateRecipientLabel(input: {
  professional_user_id?: unknown;
  label?: unknown;
}):
  | {
      ok: true;
      professionalUserId: string;
      label: PatientRecipientLabelId;
    }
  | { ok: false; error: string } {
  const professionalUserId = normalizeProfessionalUserId(
    input.professional_user_id,
  );
  if (!professionalUserId) {
    return { ok: false, error: "No se pudo identificar a ese profesional." };
  }
  if (!isPatientRecipientLabelId(input.label)) {
    return { ok: false, error: "Elige cómo es esa persona para ti." };
  }
  return { ok: true, professionalUserId, label: input.label };
}

export function validateRecipientPatch(input: {
  professional_user_id?: unknown;
  label?: unknown;
  repeat_mode?: unknown;
}):
  | {
      ok: true;
      professionalUserId: string;
      label?: PatientRecipientLabelId;
      repeatMode?: RecipientRepeatMode | null;
    }
  | { ok: false; error: string } {
  const professionalUserId = normalizeProfessionalUserId(
    input.professional_user_id,
  );
  if (!professionalUserId) {
    return { ok: false, error: "No se pudo identificar a ese profesional." };
  }

  const patch: {
    professionalUserId: string;
    label?: PatientRecipientLabelId;
    repeatMode?: RecipientRepeatMode | null;
  } = { professionalUserId };

  if ("label" in input && input.label !== undefined) {
    if (!isPatientRecipientLabelId(input.label)) {
      return { ok: false, error: "Elige cómo es esa persona para ti." };
    }
    patch.label = input.label;
  }

  if ("repeat_mode" in input) {
    if (input.repeat_mode === null || input.repeat_mode === "") {
      patch.repeatMode = null;
    } else {
      const repeatMode = parseRepeatMode(input.repeat_mode);
      if (!repeatMode) {
        return {
          ok: false,
          error: "Elige el mes que viene o todos los meses.",
        };
      }
      patch.repeatMode = repeatMode;
    }
  }

  if (patch.label === undefined && patch.repeatMode === undefined) {
    return { ok: false, error: "No hay nada que actualizar." };
  }
  return { ok: true, ...patch };
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
