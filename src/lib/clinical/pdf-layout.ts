import PDFDocument from "pdfkit";
import {
  MEAL_SLOTS,
  MEAL_SLOT_LABELS,
} from "@/lib/domain/intake";
import { formatRations } from "@/lib/domain/rations";
import type { PdfReportDto } from "@/lib/domain/clinical-export";

export async function renderClinicalPdf(dto: PdfReportDto): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(20).text("Migajas", { continued: false });
  doc.moveDown(0.5);
  doc.fontSize(16).text(dto.title);
  doc.fontSize(11).fillColor("#444444");
  doc.text(`Región: ${dto.regionName}`);
  doc.text(`Periodo: ${dto.from} a ${dto.to}`);
  if (dto.goalG) {
    doc.text(`Meta diaria: ${dto.goalG} g de HC`);
  }
  doc.moveDown();

  doc.fillColor("#111111").fontSize(13).text("Resumen diario");
  doc.moveDown(0.5);
  doc.fontSize(10);

  for (const day of dto.days) {
    if (day.totalCarbsG === 0) continue;
    const goalText =
      dto.goalG && day.goalPercent != null
        ? ` · ${day.goalPercent}% de la meta`
        : "";
    doc.text(
      `${day.date}: ${day.totalCarbsG} g HC (${formatRations(day.totalRations)} raciones)${goalText}`,
    );
    for (const slot of MEAL_SLOTS) {
      const meal = day.meals[slot];
      if (!meal || meal.carbsG === 0) continue;
      doc.text(
        `  - ${MEAL_SLOT_LABELS[slot]}: ${meal.carbsG} g HC (${formatRations(meal.rations)} raciones)`,
        { indent: 12 },
      );
    }
  }

  if (dto.rollups.length > 0) {
    doc.moveDown();
    doc.fontSize(13).text("Totales agregados");
    doc.moveDown(0.5).fontSize(10);
    for (const rollup of dto.rollups) {
      doc.text(
        `${rollup.label} (${rollup.from} a ${rollup.to}): ${rollup.totalCarbsG} g HC`,
      );
    }
  }

  if (dto.topFoods.length > 0) {
    doc.moveDown();
    doc.fontSize(13).text("Alimentos más registrados");
    doc.moveDown(0.5).fontSize(10);
    for (const food of dto.topFoods.slice(0, 10)) {
      doc.text(
        `${food.foodName}: ${food.totalCarbsG} g HC · ${food.entryCount} registro(s)`,
      );
    }
  }

  doc.moveDown();
  doc.fontSize(9).fillColor("#666666").text(dto.disclaimer, {
    align: "left",
  });

  doc.end();
  return done;
}
