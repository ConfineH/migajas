import { NextResponse } from "next/server";
import { requireClinicalAccess } from "@/lib/clinical-access";
import { renderClinicalPdf } from "@/lib/clinical/pdf-layout";
import { buildClinicalReport, parseExportRange } from "@/lib/domain/clinical-report";
import {
  buildClinicalCsv,
  buildExportFilename,
  buildPdfReportDto,
} from "@/lib/domain/clinical-export";
import { getFoodById } from "@/lib/data/foods";
import { getRegionById } from "@/lib/domain/regions";
import { listIntakeEntries } from "@/lib/supabase/intake";

export const runtime = "nodejs";

function getTodayUtcDate(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

export async function GET(request: Request) {
  const access = await requireClinicalAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const range = url.searchParams.get("range") ?? "7d";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (format !== "csv" && format !== "pdf") {
    return NextResponse.json(
      { error: "Formato no válido. Usa csv o pdf." },
      { status: 400 },
    );
  }

  const parsedRange = parseExportRange(range, from, to, new Date(getTodayUtcDate()));
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

  const report = buildClinicalReport(
    entries,
    parsedRange.from,
    parsedRange.to,
    access.profile.daily_carb_goal_g,
    { includeTopFoods: true },
  );

  const filename = buildExportFilename(format, parsedRange.from, parsedRange.to);
  const region = getRegionById(access.profile.region_id);

  if (format === "csv") {
    const csv = buildClinicalCsv(report);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const pdfDto = buildPdfReportDto(report, {
    from: parsedRange.from,
    to: parsedRange.to,
    regionName: region.name,
  });
  const pdfBuffer = await renderClinicalPdf(pdfDto);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
