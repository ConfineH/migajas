import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import { buildClinicalReport, parseExportRange } from "@/lib/domain/clinical-report";
import { getFoodById } from "@/lib/data/foods";
import {
  formatRecipientLastSent,
  formatRecipientListLabel,
  formatRepeatDue,
  isRecipientSendDue,
  normalizeProfessionalUserId,
  normalizeShareCode,
  recipientResendPreview,
  sortDiaryRecipients,
  validateRecipientPatch,
  validateShareConfirmation,
} from "@/lib/domain/professional-profile";
import { listIntakeEntries } from "@/lib/supabase/intake";
import {
  deleteSharesSentToProfessional,
  listPatientShareRecipients,
  shareReportWithProfessional,
  updatePatientRecipientContact,
} from "@/lib/supabase/professional";

function getTodayUtcDate(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

export async function GET() {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const result = await listPatientShareRecipients();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  const now = new Date();
  return NextResponse.json({
    recipients: sortDiaryRecipients(result, now).map((recipient) => ({
      professional_user_id: recipient.professionalUserId,
      share_code: recipient.shareCode,
      label_id: recipient.label,
      title: formatRecipientListLabel(recipient),
      last_sent_label: formatRecipientLastSent(recipient.lastSentAt),
      share_count: recipient.shareCount,
      preview: recipientResendPreview(recipient),
      can_resend: Boolean(recipient.shareCode),
      has_copies: recipient.shareCount > 0,
      repeat_mode: recipient.repeatMode,
      repeat_due_label: formatRepeatDue(recipient.repeatDueAt),
      due: isRecipientSendDue(recipient.repeatDueAt, now),
    })),
  });
}

export async function DELETE(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await request.json();
  const professionalUserId = normalizeProfessionalUserId(
    body.professional_user_id,
  );
  if (!professionalUserId) {
    return NextResponse.json(
      { error: "No se pudo identificar a ese profesional." },
      { status: 400 },
    );
  }

  const deleted = await deleteSharesSentToProfessional(
    access.user.id,
    professionalUserId,
  );
  if (!deleted) {
    return NextResponse.json(
      { error: "No se pudieron borrar las copias enviadas." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await request.json();
  const parsed = validateRecipientPatch(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await updatePatientRecipientContact({
    patientUserId: access.user.id,
    professionalUserId: parsed.professionalUserId,
    label: parsed.label,
    repeatMode: parsed.repeatMode,
  });
  if (!updated) {
    return NextResponse.json(
      { error: "No se pudo guardar esa preferencia." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await request.json();
  const shareCode = normalizeShareCode(body.share_code);
  if (!shareCode) {
    return NextResponse.json(
      { error: "El código del profesional no es válido." },
      { status: 400 },
    );
  }

  const confirmation = validateShareConfirmation({ confirm: body.confirm });
  if (!confirmation.ok) {
    return NextResponse.json({ error: confirmation.error }, { status: 400 });
  }

  const parsedRange = parseExportRange(
    body.range ?? "7d",
    body.from,
    body.to,
    new Date(getTodayUtcDate()),
  );
  if (!parsedRange.ok) {
    return NextResponse.json({ error: parsedRange.error }, { status: 400 });
  }

  const rawEntries = await listIntakeEntries(
    access.user.id,
    parsedRange.from,
    parsedRange.to,
  );
  const entries = rawEntries.map((entry) => ({
    ...entry,
    foodName: getFoodById(entry.food_id)?.name ?? entry.food_id,
  }));
  const snapshot = buildClinicalReport(
    entries,
    parsedRange.from,
    parsedRange.to,
    access.profile.daily_carb_goal_g,
    { includeTopFoods: true },
  );

  const result = await shareReportWithProfessional({
    shareCode,
    rangeFrom: parsedRange.from,
    rangeTo: parsedRange.to,
    snapshot,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
