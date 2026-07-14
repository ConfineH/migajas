import { describe, it, expect } from "vitest";
import { getFoods } from "@/lib/data/foods";
import { getExerciseById, getLevels } from "@/lib/domain/exercises";
import { getLessonById } from "@/lib/domain/lessons";
import {
  localizeExercise,
  localizeLesson,
  localizeLevel,
  resolveRegionalFoodId,
} from "@/lib/domain/content-localization";
import { getRegionById } from "@/lib/domain/regions";

const foods = getFoods();
const spain = getRegionById("es");
const dominican = getRegionById("do");

describe("resolveRegionalFoodId", () => {
  it("keeps Spain food ids for España", () => {
    expect(resolveRegionalFoodId("pan-blanco", "es")).toBe("pan-blanco");
  });

  it("maps Spain staples to Dominican equivalents", () => {
    expect(resolveRegionalFoodId("pan-blanco", "do")).toBe("casabe");
    expect(resolveRegionalFoodId("paella", "do")).toBe("moro-habichuelas");
  });
});

describe("localizeLevel", () => {
  it("localizes nivel descriptions for República Dominicana", () => {
    const level = getLevels().find((item) => item.id === "nivel-4");
    expect(level).toBeDefined();

    const localized = localizeLevel(level!, dominican);

    expect(localized.description).toContain("Mangú");
    expect(localized.description).not.toContain("paella");
  });
});

describe("localizeLesson", () => {
  it("returns lesson unchanged for España", () => {
    const lesson = getLessonById("l4-lesson-2");
    expect(lesson).toBeDefined();
    expect(localizeLesson(lesson!, spain, foods)).toEqual(lesson);
  });

  it("swaps food examples and titles for República Dominicana", () => {
    const lesson = getLessonById("l4-lesson-2");
    expect(lesson).toBeDefined();

    const localized = localizeLesson(lesson!, dominican, foods);
    const paellaStep = lesson!.steps.find((step) => step.foodId === "paella");

    expect(localized.title).toBe("Comidas dominicanas de cada día");
    expect(
      localized.steps.find((step) => step.id === paellaStep?.id)?.foodId,
    ).toBe("moro-habichuelas");
    expect(localized.steps.find((step) => step.id === paellaStep?.id)?.body).toContain(
      "arroz con habichuelas",
    );
  });

  it("avoids nutrition jargon in Dominican nivel 2 copy", () => {
    const level = getLevels().find((item) => item.id === "nivel-2");
    expect(level).toBeDefined();

    const localized = localizeLevel(level!, dominican);

    expect(localized.description.toLowerCase()).toContain("yuca");
    expect(localized.description.toLowerCase()).not.toContain("viandas");
    expect(localized.description).not.toMatch(/\bHC\b/);
  });

  it("localizes nivel 1 introduction for República Dominicana", () => {
    const lesson = getLessonById("l1-lesson-1");
    expect(lesson).toBeDefined();

    const localized = localizeLesson(lesson!, dominican, foods);
    const example = localized.steps.find((step) => step.id === "l1-1-s2");

    expect(localized.summary).toContain("República Dominicana");
    expect(example?.foodId).toBe("casabe");
    expect(example?.body.toLowerCase()).toContain("casabe");
  });
});

describe("localizeExercise", () => {
  it("recalculates rations with 15 g rule for Dominican foods", () => {
    const exercise = getExerciseById("n1-ex1");
    expect(exercise?.foodId).toBe("pan-blanco");

    const localized = localizeExercise(exercise!, dominican, foods);

    expect(localized.foodId).toBe("casabe");
    expect(localized.correctAnswer).toBe("1.0");
    expect(localized.prompt.toLowerCase()).toContain("casabe");
    expect(localized.explanation).toContain("15");
  });

  it("maps identify_portion answers to regional food ids", () => {
    const exercise = getExerciseById("n4-ex3");
    expect(exercise?.type).toBe("identify_portion");
    expect(exercise?.foodId).toBe("paella");

    const localized = localizeExercise(exercise!, dominican, foods);

    expect(localized.correctAnswer).toBe("moro-habichuelas");
    expect(
      localized.options.find((option) => option.isCorrect)?.value,
    ).toBe("moro-habichuelas");
  });
});
