import {
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
} from "@/lib/domain/intake";
import { formatRations } from "@/lib/domain/rations";
import type { ClinicalReport } from "@/lib/domain/clinical-report";

export const CLINICAL_EXPORT_DISCLAIMER =
  "Este reporte es educativo y sirve para el auto-seguimiento del aprendizaje en el conteo de carbohidratos. No es consejo clínico, diagnóstico ni tratamiento médico.";

export interface PdfReportDto {
  title: string;
  regionName: string;
  from: string;
  to: string;
  goalG: number | null;
  days: ClinicalReport["days"];
  rollups: ClinicalReport["rollups"];
  topFoods: ClinicalReport["topFoods"];
  disclaimer: string;
}

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function csvRow(values: Array<string | number | null | undefined>): string {
  return values.map((value) => escapeCsv(value)).join(",");
}

export function buildClinicalCsv(report: ClinicalReport): string {
  const lines = [
    csvRow([
      "section",
      "date",
      "meal_slot",
      "label",
      "carbs_g",
      "rations",
      "goal_g",
      "goal_percent",
    ]),
  ];

  for (const day of report.days) {
    lines.push(
      csvRow([
        "daily",
        day.date,
        "",
        "total",
        day.totalCarbsG,
        formatRations(day.totalRations),
        report.goalG,
        day.goalPercent,
      ]),
    );

    for (const slot of MEAL_SLOTS) {
      const meal = day.meals[slot];
      if (!meal || meal.carbsG === 0) continue;
      lines.push(
        csvRow([
          "meal",
          day.date,
          slot,
          MEAL_SLOT_LABELS[slot],
          meal.carbsG,
          formatRations(meal.rations),
          "",
          "",
        ]),
      );
    }
  }

  for (const rollup of report.rollups) {
    lines.push(
      csvRow([
        "rollup",
        rollup.from,
        rollup.kind,
        rollup.label,
        rollup.totalCarbsG,
        formatRations(rollup.totalRations),
        rollup.to,
        "",
      ]),
    );
  }

  for (const food of report.topFoods) {
    lines.push(
      csvRow([
        "top_food",
        "",
        "",
        food.foodName,
        food.totalCarbsG,
        food.entryCount,
        "",
        "",
      ]),
    );
  }

  return `${lines.join("\n")}\n`;
}

export function buildPdfReportDto(
  report: ClinicalReport,
  options: { from: string; to: string; regionName: string },
): PdfReportDto {
  return {
    title: "Reporte de ingesta de carbohidratos",
    regionName: options.regionName,
    from: options.from,
    to: options.to,
    goalG: report.goalG,
    days: report.days,
    rollups: report.rollups,
    topFoods: report.topFoods,
    disclaimer: CLINICAL_EXPORT_DISCLAIMER,
  };
}

export function buildExportFilename(
  format: "csv" | "pdf",
  from: string,
  to: string,
): string {
  return `migajas-reporte-${from}-a-${to}.${format}`;
}
