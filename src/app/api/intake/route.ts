import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import { getFoodById } from "@/lib/data/foods";
import {
  assertSameDayEditable,
  buildIntakeEntry,
  validateIntakeWrite,
  validateLocalDate,
  validatePortionMultiplier,
} from "@/lib/domain/intake";
import {
  deleteIntakeEntry,
  getIntakeEntry,
  insertIntakeEntry,
  listIntakeEntries,
  updateIntakeEntry,
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

export async function POST(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const body = await request.json();
  const validation = validateIntakeWrite(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const food = getFoodById(validation.value.food_id);
  if (!food) {
    return NextResponse.json({ error: "Alimento no encontrado." }, { status: 404 });
  }

  const draft = buildIntakeEntry(
    validation.value,
    food,
    access.profile.region_id,
  );
  const entry = await insertIntakeEntry(access.user.id, draft);
  if (!entry) {
    return NextResponse.json(
      { error: "No se pudo guardar la entrada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ entry });
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
  const entryId = typeof body.id === "string" ? body.id : null;
  const localDate = typeof body.local_date === "string" ? body.local_date : null;
  const portionMultiplier = validatePortionMultiplier(body.portion_multiplier);

  if (!entryId || validateLocalDate(localDate)) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }
  if (portionMultiplier === null) {
    return NextResponse.json({ error: "Porción no válida." }, { status: 400 });
  }

  const existing = await getIntakeEntry(access.user.id, entryId);
  if (!existing) {
    return NextResponse.json({ error: "Entrada no encontrada." }, { status: 404 });
  }

  const sameDayError = assertSameDayEditable(existing.local_date, localDate!);
  if (sameDayError) {
    return NextResponse.json({ error: sameDayError }, { status: 403 });
  }

  const food = getFoodById(existing.food_id);
  if (!food) {
    return NextResponse.json({ error: "Alimento no encontrado." }, { status: 404 });
  }

  const draft = buildIntakeEntry(
    {
      food_id: existing.food_id,
      meal_slot: existing.meal_slot,
      local_date: existing.local_date,
      portion_multiplier: portionMultiplier,
    },
    food,
    access.profile.region_id,
    { logged_at: existing.logged_at },
  );

  const entry = await updateIntakeEntry(access.user.id, entryId, draft);
  if (!entry) {
    return NextResponse.json(
      { error: "No se pudo actualizar la entrada." },
      { status: 500 },
    );
  }

  return NextResponse.json({ entry });
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
