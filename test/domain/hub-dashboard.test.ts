import { describe, it, expect } from "vitest";
import { getLevels } from "@/lib/domain/exercises";
import {
  getGuidedItemHref,
  getHubProgressSummary,
  resolveHubCourseFocus,
} from "@/lib/domain/hub-dashboard";
import type { GuidedProgress } from "@/lib/domain/guided-flow";
import { completeLesson } from "@/lib/domain/guided-flow";
import { getLessonsForLevel } from "@/lib/domain/lessons";

const empty: GuidedProgress = {
  completedLessons: [],
  completedPracticeSteps: [],
  completedFlashcardLevels: [],
  levelCompletions: [],
  freeModeUnlocked: false,
};

describe("getGuidedItemHref", () => {
  it("builds lesson href", () => {
    expect(
      getGuidedItemHref("nivel-1", {
        type: "lesson",
        id: "leccion-1",
        title: "Intro",
      }),
    ).toBe("/learn/nivel-1/lessons/leccion-1");
  });

  it("builds exam href", () => {
    expect(
      getGuidedItemHref("nivel-1", {
        type: "exam",
        id: "examen-nivel-1",
        title: "Examen",
      }),
    ).toBe("/learn/nivel-1/exam");
  });
});

describe("resolveHubCourseFocus", () => {
  const levels = getLevels();

  it("returns first lesson for fresh progress", () => {
    const focus = resolveHubCourseFocus(empty, levels);
    expect(focus?.levelId).toBe("nivel-1");
    expect(focus?.nextItem?.type).toBe("lesson");
    expect(focus?.continueHref).toContain("/lessons/");
  });

  it("advances after completing a lesson", () => {
    const lessons = getLessonsForLevel("nivel-1");
    const progress = completeLesson(empty, lessons[0]!.id);
    const focus = resolveHubCourseFocus(progress, levels);
    expect(focus?.nextItem?.type).toBe("practice");
  });
});

describe("getHubProgressSummary", () => {
  const levels = getLevels();

  it("reports zero passed levels initially", () => {
    const summary = getHubProgressSummary(empty, levels, "nivel-1");
    expect(summary.passedLevels).toBe(0);
    expect(summary.totalLevels).toBe(levels.length);
    expect(summary.activePercent).toBe(0);
  });
});
