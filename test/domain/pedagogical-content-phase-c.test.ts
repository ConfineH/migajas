import { describe, it, expect } from "vitest";
import { getFoods } from "@/lib/data/foods";
import { getAllExercises, getExerciseById } from "@/lib/domain/exercises";
import { getExamForLevel } from "@/lib/domain/lessons";
import { buildReferenceTips } from "@/lib/domain/reference-guide";

/** Foods introduced in pedagogical v2 (scripts/build-pedagogical-v2.mjs NEW_FOODS). */
const V2_FOOD_IDS = [
  "pan-molde",
  "aceite-oliva",
  "pan-integral-100g",
  "arroz-cocido-150g",
  "pasta-cocida-140g",
  "arroz-integral-cocido-150g",
  "patata-cocida-150g",
  "boniato-asado-130g",
  "lentejas-cocidas-200g",
  "maiz-grano",
  "guisantes-cocidos",
  "pina-almibar",
  "ensalada-mixta",
  "ketchup",
  "calamares-romana",
  "pasta-carbonara",
  "pizza-pepperoni",
  "tostadas-pan",
  "nueces",
  "cerveza",
  "vino-tinto",
  "tarta-cumpleanos",
  "chocolate-leche",
  "bocadillo-jamon",
  "patatas-fritas-150g",
  "patatas-fritas-100g",
  "leche-semi-200ml",
] as const;

const PHASE_C_FOOD_IDS = [
  "tomate-frito",
  "embutido-almidon",
  "salsa-barbacoa",
] as const;

const PHASE_C_EXERCISE_IDS = [
  "n1-ex13",
  "n1-ex14",
  "n1-ex15",
  "n2-ex11",
  "n2-ex12",
  "n3-ex11",
  "n4-ex13",
  "n4-ex14",
  "n5-ex16",
  "n5-ex17",
] as const;

const EXPANDED_EXAM_SPECS: Record<
  string,
  { poolSize: number; questionsPerExam: number }
> = {
  "nivel-1": { poolSize: 15, questionsPerExam: 5 },
  "nivel-2": { poolSize: 12, questionsPerExam: 4 },
  "nivel-3": { poolSize: 11, questionsPerExam: 4 },
  "nivel-4": { poolSize: 14, questionsPerExam: 4 },
  "nivel-5": { poolSize: 17, questionsPerExam: 6 },
};

describe("pedagogical content phase C (ES refinamiento)", () => {
  it("Spain reference guide covers fiber, delayed glucose, and alcohol", () => {
    const tips = buildReferenceTips(10, "España", "es");
    const joined = tips.join(" ").toLowerCase();
    expect(tips.length).toBeGreaterThanOrEqual(7);
    expect(joined).toMatch(/fibra|hc totales/);
    expect(joined).toMatch(/glucosa|glucemia/);
    expect(joined).toMatch(/alcohol/);
    expect(joined).toContain("modulador");
  });

  it("includes phase C audit foods", () => {
    const foodIds = new Set(getFoods().map((f) => f.id));
    for (const id of PHASE_C_FOOD_IDS) {
      expect(foodIds.has(id), `missing food ${id}`).toBe(true);
    }
  });

  for (const exerciseId of PHASE_C_EXERCISE_IDS) {
    it(`estimation exercise ${exerciseId} exists`, () => {
      const exercise = getExerciseById(exerciseId);
      expect(exercise).toBeDefined();
      expect(["count_rations", "identify_portion"]).toContain(exercise!.type);
    });
  }

  for (const [levelId, spec] of Object.entries(EXPANDED_EXAM_SPECS)) {
    it(`${levelId} exam pool expanded to ${spec.poolSize}`, () => {
      const exam = getExamForLevel(levelId);
      expect(exam).toBeDefined();
      expect(exam!.poolExerciseIds).toHaveLength(spec.poolSize);
      expect(exam!.questionsPerExam).toBe(spec.questionsPerExam);
      for (const id of PHASE_C_EXERCISE_IDS) {
        const exercise = getExerciseById(id);
        if (exercise?.levelId === levelId) {
          expect(exam!.poolExerciseIds).toContain(id);
        }
      }
    });
  }

  it("v2 foods have plausible carb data and documentation", () => {
    const foods = getFoods();
    for (const id of V2_FOOD_IDS) {
      const food = foods.find((f) => f.id === id);
      expect(food, `missing v2 food ${id}`).toBeDefined();
      expect(food!.carbsG).toBeGreaterThanOrEqual(0);
      expect(food!.grams).toBeGreaterThan(0);
      if (food!.itemType === "modulator") {
        expect(food!.carbsG).toBeLessThanOrEqual(5);
      } else {
        const ratio = food!.carbsG / food!.grams;
        expect(ratio).toBeLessThanOrEqual(1);
      }
      expect(food!.notes?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("phase C foods reference BEDCA in notes", () => {
    const foods = getFoods();
    for (const id of PHASE_C_FOOD_IDS) {
      const food = foods.find((f) => f.id === id);
      expect(food?.notes?.toUpperCase()).toContain("BEDCA");
    }
  });
});
