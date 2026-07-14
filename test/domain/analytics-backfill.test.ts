import { describe, it, expect } from "vitest";
import {
  buildBackfillEvents,
  extractExistingAnalyticsKeys,
} from "@/lib/domain/analytics-backfill";

describe("analytics-backfill", () => {
  const lessons = [
    { id: "l1-lesson-1", levelId: "nivel-1" },
    { id: "l1-lesson-2", levelId: "nivel-1" },
  ];

  it("builds missing lesson and exam events", () => {
    const events = buildBackfillEvents(
      {
        completedLessons: ["l1-lesson-1", "l1-lesson-2"],
        completedPracticeSteps: [],
        freeModeUnlocked: true,
        completions: [
          {
            levelId: "nivel-1",
            masteryScore: 100,
            correctCount: 5,
            totalCount: 5,
            completedAt: "2026-01-01",
            passed: true,
          },
        ],
      },
      lessons,
      extractExistingAnalyticsKeys([]),
    );

    expect(events).toHaveLength(4);
    expect(events.filter((e) => e.type === "lesson_completed")).toHaveLength(2);
    expect(events.some((e) => e.type === "free_mode_unlocked")).toBe(true);
  });

  it("skips events that already exist", () => {
    const existing = extractExistingAnalyticsKeys([
      {
        event_type: "lesson_completed",
        payload: { lessonId: "l1-lesson-1", levelId: "nivel-1" },
      },
    ]);

    const events = buildBackfillEvents(
      {
        completedLessons: ["l1-lesson-1"],
        completedPracticeSteps: [],
        freeModeUnlocked: false,
        completions: [],
      },
      lessons,
      existing,
    );

    expect(events).toHaveLength(0);
  });
});
