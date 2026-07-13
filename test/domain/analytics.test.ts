import { describe, it, expect } from "vitest";
import {
  buildLessonCompletedEvent,
  buildExamPassedEvent,
  buildFreeModeUnlockedEvent,
  shouldEmitExamPassed,
  shouldEmitFreeModeUnlocked,
  type LearningEvent,
} from "@/lib/domain/analytics";

describe("buildLessonCompletedEvent", () => {
  it("creates event with lesson and level ids", () => {
    const event = buildLessonCompletedEvent("l1-lesson-1", "nivel-1");
    expect(event.type).toBe("lesson_completed");
    expect(event.lessonId).toBe("l1-lesson-1");
    expect(event.levelId).toBe("nivel-1");
    expect(event.timestamp).toBeTruthy();
  });
});

describe("buildExamPassedEvent", () => {
  it("creates event with level id and mastery score", () => {
    const event = buildExamPassedEvent("nivel-2", 75);
    expect(event.type).toBe("exam_passed");
    expect(event.levelId).toBe("nivel-2");
    expect(event.masteryScore).toBe(75);
  });
});

describe("buildFreeModeUnlockedEvent", () => {
  it("creates free mode event", () => {
    const event = buildFreeModeUnlockedEvent();
    expect(event.type).toBe("free_mode_unlocked");
    expect(event.levelId).toBe("nivel-1");
  });
});

describe("shouldEmitExamPassed", () => {
  it("returns true when passed", () => {
    expect(shouldEmitExamPassed(true)).toBe(true);
  });

  it("returns false when not passed", () => {
    expect(shouldEmitExamPassed(false)).toBe(false);
  });
});

describe("shouldEmitFreeModeUnlocked", () => {
  it("emits on first nivel-1 pass", () => {
    expect(
      shouldEmitFreeModeUnlocked("nivel-1", true, false),
    ).toBe(true);
  });

  it("skips when already unlocked", () => {
    expect(
      shouldEmitFreeModeUnlocked("nivel-1", true, true),
    ).toBe(false);
  });

  it("skips for non-nivel-1 levels", () => {
    expect(
      shouldEmitFreeModeUnlocked("nivel-2", true, false),
    ).toBe(false);
  });

  it("skips when exam not passed", () => {
    expect(
      shouldEmitFreeModeUnlocked("nivel-1", false, false),
    ).toBe(false);
  });
});

describe("event shape", () => {
  it("all events include type and timestamp", () => {
    const events: LearningEvent[] = [
      buildLessonCompletedEvent("l1-lesson-1", "nivel-1"),
      buildExamPassedEvent("nivel-1", 80),
      buildFreeModeUnlockedEvent(),
    ];
    for (const event of events) {
      expect(event.type).toBeTruthy();
      expect(new Date(event.timestamp).getTime()).not.toBeNaN();
    }
  });
});
