import { describe, it, expect } from "vitest";
import { buildClinicalCsv, buildPdfReportDto } from "@/lib/domain/clinical-export";
import { buildClinicalReport } from "@/lib/domain/clinical-report";
import type { IntakeEntry } from "@/lib/domain/intake";

const entries: Array<IntakeEntry & { foodName: string }> = [
  {
    id: "1",
    user_id: "u1",
    food_id: "manzana",
    meal_slot: "desayuno",
    logged_at: "2026-07-12T08:00:00Z",
    local_date: "2026-07-12",
    portion_multiplier: 1,
    carbs_g: 10,
    rations: 1,
    foodName: "Manzana pequeña",
  },
];

describe("buildClinicalCsv", () => {
  it("includes daily and meal rows", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-12", 180);
    const csv = buildClinicalCsv(report);
    expect(csv).toContain("section,date,meal_slot,label,carbs_g,rations,goal_g,goal_percent");
    expect(csv).toContain("daily,2026-07-12,,total,10,1.0,180,6");
    expect(csv).toContain("meal,2026-07-12,desayuno,Desayuno,10,1.0,,");
  });
});

describe("buildPdfReportDto", () => {
  it("includes Spanish disclaimer", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-12", null);
    const dto = buildPdfReportDto(report, {
      from: "2026-07-12",
      to: "2026-07-12",
      regionName: "España",
    });
    expect(dto.disclaimer).toMatch(/educativo/i);
    expect(dto.disclaimer).toMatch(/no es consejo clínico/i);
  });
});
