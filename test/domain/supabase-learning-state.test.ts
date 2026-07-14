import { describe, it, expect } from "vitest";
import { parseUserProgress } from "@/lib/supabase/learning-state";

describe("parseUserProgress", () => {
  it("preserves activeExamSessions from Supabase JSON", () => {
    const session = {
      levelId: "nivel-2",
      exerciseIds: ["ex-1", "ex-2"],
      startedAt: "2026-07-14T12:00:00.000Z",
      inProgress: true,
    };

    const parsed = parseUserProgress({
      completions: [],
      completedLessons: ["l1"],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      activeExamSessions: [session],
    });

    expect(parsed.activeExamSessions).toEqual([session]);
  });

  it("preserves completedFlashcardLevels from Supabase JSON", () => {
    const parsed = parseUserProgress({
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      completedFlashcardLevels: ["nivel-2"],
    });
    expect(parsed.completedFlashcardLevels).toEqual(["nivel-2"]);
  });

  it("returns empty progress for invalid input", () => {
    expect(parseUserProgress(null).activeExamSessions).toBeUndefined();
    expect(parseUserProgress(null).completedLessons).toEqual([]);
  });
});
