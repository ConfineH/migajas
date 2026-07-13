import { describe, it, expect } from "vitest";
import {
  aggregateAnalyticsDashboard,
  enrichDashboardWithProgress,
  formatEventLabel,
  type StoredLearningEvent,
} from "@/lib/domain/analytics-dashboard";

const levels = [
  { id: "nivel-1", lessonCount: 3 },
  { id: "nivel-2", lessonCount: 2 },
];

function row(
  type: StoredLearningEvent["eventType"],
  payload: Record<string, unknown>,
  createdAt: string,
): StoredLearningEvent {
  return { eventType: type, payload, createdAt };
}

describe("aggregateAnalyticsDashboard", () => {
  it("returns empty dashboard for no events", () => {
    const dash = aggregateAnalyticsDashboard([], levels);
    expect(dash.lessonsCompleted).toBe(0);
    expect(dash.examsPassed).toBe(0);
    expect(dash.freeModeUnlocked).toBe(false);
    expect(dash.levelFunnel).toHaveLength(2);
    expect(dash.timeline).toHaveLength(0);
  });

  it("counts unique lessons and exams per level", () => {
    const events: StoredLearningEvent[] = [
      row(
        "lesson_completed",
        { lessonId: "l1-lesson-1", levelId: "nivel-1" },
        "2026-07-01T10:00:00Z",
      ),
      row(
        "lesson_completed",
        { lessonId: "l1-lesson-2", levelId: "nivel-1" },
        "2026-07-01T11:00:00Z",
      ),
      row(
        "exam_passed",
        { levelId: "nivel-1", masteryScore: 80 },
        "2026-07-01T12:00:00Z",
      ),
    ];
    const dash = aggregateAnalyticsDashboard(events, levels);
    expect(dash.lessonsCompleted).toBe(2);
    expect(dash.examsPassed).toBe(1);
    expect(dash.levelFunnel[0].lessonsCompleted).toBe(2);
    expect(dash.levelFunnel[0].examPassed).toBe(true);
    expect(dash.levelFunnel[0].bestMasteryScore).toBe(80);
  });

  it("detects free mode unlock", () => {
    const events: StoredLearningEvent[] = [
      row("free_mode_unlocked", { levelId: "nivel-1" }, "2026-07-02T10:00:00Z"),
    ];
    expect(aggregateAnalyticsDashboard(events, levels).freeModeUnlocked).toBe(
      true,
    );
  });

  it("builds timeline newest first", () => {
    const events: StoredLearningEvent[] = [
      row(
        "lesson_completed",
        { lessonId: "l1-lesson-1", levelId: "nivel-1" },
        "2026-07-01T10:00:00Z",
      ),
      row(
        "exam_passed",
        { levelId: "nivel-1", masteryScore: 70 },
        "2026-07-02T10:00:00Z",
      ),
    ];
    const dash = aggregateAnalyticsDashboard(events, levels);
    expect(dash.timeline[0].eventType).toBe("exam_passed");
    expect(dash.timeline).toHaveLength(2);
  });

  it("dedupes duplicate lesson events", () => {
    const events: StoredLearningEvent[] = [
      row(
        "lesson_completed",
        { lessonId: "l1-lesson-1", levelId: "nivel-1" },
        "2026-07-01T10:00:00Z",
      ),
      row(
        "lesson_completed",
        { lessonId: "l1-lesson-1", levelId: "nivel-1" },
        "2026-07-01T11:00:00Z",
      ),
    ];
    expect(aggregateAnalyticsDashboard(events, levels).lessonsCompleted).toBe(1);
  });
});

describe("enrichDashboardWithProgress", () => {
  it("fills funnel from synced progress when events are empty", () => {
    const dash = aggregateAnalyticsDashboard([], levels);
    const enriched = enrichDashboardWithProgress(
      dash,
      {
        completedLessons: ["l1-lesson-1", "l1-lesson-2", "l1-lesson-3"],
        freeModeUnlocked: true,
        completions: [
          {
            levelId: "nivel-1",
            masteryScore: 100,
            passed: true,
          },
        ],
      },
      {
        "nivel-1": ["l1-lesson-1", "l1-lesson-2", "l1-lesson-3"],
        "nivel-2": ["l2-lesson-1", "l2-lesson-2"],
      },
    );
    expect(enriched.levelFunnel[0].progressPercent).toBe(100);
    expect(enriched.lessonsCompleted).toBe(3);
    expect(enriched.freeModeUnlocked).toBe(true);
  });
});

describe("formatEventLabel", () => {
  it("returns Spanish labels", () => {
    expect(
      formatEventLabel({
        eventType: "lesson_completed",
        payload: { lessonId: "l1-lesson-1", levelId: "nivel-1" },
        createdAt: "2026-07-01",
      }),
    ).toContain("Lección");
    expect(
      formatEventLabel({
        eventType: "exam_passed",
        payload: { levelId: "nivel-2", masteryScore: 75 },
        createdAt: "2026-07-01",
      }),
    ).toContain("Examen");
  });
});
