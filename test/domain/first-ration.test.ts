import { describe, expect, it } from "vitest";
import { getFoodById } from "@/lib/data/foods";
import {
  FIRST_RATION_COPY,
  FIRST_RATION_STAPLE_IDS,
  buildFirstRationSession,
  gradeFirstRationAnswer,
} from "@/lib/domain/first-ration";
import { calculateRations } from "@/lib/domain/rations";

describe("first-ration", () => {
  it("resolves six staple foods per region and a one-ration estimate", () => {
    for (const regionId of ["es", "do"] as const) {
      const session = buildFirstRationSession(regionId, getFoodById);
      expect(session).not.toBeNull();
      expect(session?.staples).toHaveLength(6);
      expect(FIRST_RATION_STAPLE_IDS[regionId]).toHaveLength(6);
      const unit = regionId === "es" ? 10 : 15;
      expect(session?.estimate.carbsG).toBe(unit);
      expect(calculateRations(session!.estimate.carbsG, unit)).toBe(1);
      expect(session?.correctAnswer).toBe("1");
      expect(session?.options.some((option) => option.value === "1")).toBe(true);
    }
  });

  it("grades the first estimate locally", () => {
    const session = buildFirstRationSession("es", getFoodById);
    expect(session).not.toBeNull();
    expect(gradeFirstRationAnswer("1", session!.correctAnswer)).toBe(true);
    expect(gradeFirstRationAnswer("2", session!.correctAnswer)).toBe(false);
    expect(session?.explanation).toMatch(/10 g de carbohidratos = 1 ración/);
    expect(FIRST_RATION_COPY.title).toMatch(/primera ración/i);
  });
});
