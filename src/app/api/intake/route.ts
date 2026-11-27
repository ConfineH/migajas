import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import {
  assertSameDayEditable,
  validateLocalDate,
} from "@/lib/domain/intake";
import { CLINICAL_SUSPENSION_ERRORS } from "@/lib/domain/user-profile";
import {
  deleteIntakeEntry,
  getIntakeEntry,
  listIntakeEntries,
} from "@/lib/supabase/intake";

function parseDateRange(url: URL): { from: string; to: string } | null {
  const localDate = url.searchParams.get("local_date");
  if (localDate) {
    if (validateLocalDate(localDate)) return null;
    return { from: localDate, to: localDate };
  }

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) return null;
  if (validateLocalDate(from) || validateLocalDate(to)) return null;
  return { from, to };
}

export async function GET(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const range = parseDateRange(new URL(request.url));
  if (!range) {
    return NextResponse.json(
      { error: "Indica local_date o from/to." },
      { status: 400 },
    );
  }

  const entries = await listIntakeEntries(
    access.user.id,
    range.from,
    range.to,
  );
  return NextResponse.json({ entries });
}

export async function POST(_request: Request) {
  void _request;
  return NextResponse.json(
    { error: CLINICAL_SUSPENSION_ERRORS.intakeWrite },
    { status: 403 },
  );
}

export async function PATCH(_request: Request) {
  void _request;
  return NextResponse.json(
    { error: CLINICAL_SUSPENSION_ERRORS.intakeWrite },
    { status: 403 },
  );
}

export async function DELETE(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const url = new URL(request.url);
  const entryId = url.searchParams.get("id");
  const localDate = url.searchParams.get("local_date");

  if (!entryId || validateLocalDate(localDate)) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }

  const existing = await getIntakeEntry(access.user.id, entryId);
  if (!existing) {
    return NextResponse.json({ error: "Entrada no encontrada." }, { status: 404 });
  }

  const sameDayError = assertSameDayEditable(existing.local_date, localDate!);
  if (sameDayError) {
    return NextResponse.json({ error: sameDayError }, { status: 403 });
  }

  const deleted = await deleteIntakeEntry(access.user.id, entryId);
  if (!deleted) {
    return NextResponse.json(
      { error: "No se pudo eliminar la entrada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
