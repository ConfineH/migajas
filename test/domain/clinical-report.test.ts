import { describe, it, expect } from "vitest";
import {
  buildClinicalReport,
  daysBetweenInclusive,
  enumerateLocalDates,
  parseExportRange,
} from "@/lib/domain/clinical-report";
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
  {
    id: "2",
    user_id: "u1",
    food_id: "pan",
    meal_slot: "comida",
    logged_at: "2026-07-12T14:00:00Z",
    local_date: "2026-07-12",
    portion_multiplier: 2,
    carbs_g: 20,
    rations: 2,
    foodName: "Pan blanco",
  },
  {
    id: "3",
    user_id: "u1",
    food_id: "manzana",
    meal_slot: "snack",
    logged_at: "2026-07-13T16:00:00Z",
    local_date: "2026-07-13",
    portion_multiplier: 1,
    carbs_g: 10,
    rations: 1,
    foodName: "Manzana pequeña",
  },
];

describe("parseExportRange", () => {
  it("parses 7d preset ending on anchor date", () => {
    const result = parseExportRange("7d", undefined, undefined, new Date("2026-07-14"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.to).toBe("2026-07-14");
      expect(result.from).toBe("2026-07-08");
    }
  });

  it("rejects custom ranges over 90 days", () => {
    const result = parseExportRange("custom", "2026-01-01", "2026-04-15");
    expect(result.ok).toBe(false);
  });
});

describe("daysBetweenInclusive", () => {
  it("counts inclusive days", () => {
    expect(daysBetweenInclusive("2026-07-01", "2026-07-03")).toBe(3);
  });
});

describe("enumerateLocalDates", () => {
  it("lists each day in range", () => {
    expect(enumerateLocalDates("2026-07-01", "2026-07-03")).toEqual([
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
    ]);
  });
});

describe("buildClinicalReport", () => {
  it("aggregates daily totals and meal breakdown", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-13", 180);
    expect(report.days).toHaveLength(2);
    expect(report.days[0].totalCarbsG).toBe(30);
    expect(report.days[0].meals.comida?.carbsG).toBe(20);
    expect(report.days[1].totalCarbsG).toBe(10);
  });

  it("includes goal comparison when goal is set", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-12", 180);
    expect(report.goalG).toBe(180);
    expect(report.days[0].goalPercent).toBe(17);
  });

  it("omits goal comparison when goal is null", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-12", null);
    expect(report.days[0].goalPercent).toBeNull();
  });

  it("ranks top foods by carbs", () => {
    const report = buildClinicalReport(entries, "2026-07-12", "2026-07-13", null, {
      includeTopFoods: true,
    });
    expect(report.topFoods[0]).toMatchObject({
      foodName: "Manzana pequeña",
      totalCarbsG: 20,
      entryCount: 2,
    });
  });
});
