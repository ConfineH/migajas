import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import {
  formatRecipientLastSent,
  formatRecipientListLabel,
  formatRepeatDue,
  isRecipientSendDue,
  normalizeProfessionalUserId,
  recipientResendPreview,
  sortDiaryRecipients,
} from "@/lib/domain/professional-profile";
import {
  deleteSharesSentToProfessional,
  listPatientShareRecipients,
} from "@/lib/supabase/professional";

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
      can_resend: false,
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

export function PATCH() {
  return NextResponse.json(
    { error: "No se pueden cambiar los datos de un contacto ya guardado." },
    { status: 403 },
  );
}

export function POST() {
  return NextResponse.json(
    { error: "El envío de informes no está disponible." },
    { status: 403 },
  );
}
