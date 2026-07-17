import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResolveProgress = vi.fn();
const mockPersistProgress = vi.fn();

vi.mock("@/lib/learning-state", () => ({
  resolveProgress: (...args: unknown[]) => mockResolveProgress(...args),
  persistProgress: (...args: unknown[]) => mockPersistProgress(...args),
}));

vi.mock("@/lib/analytics-server", () => ({
  trackLearningEvent: vi.fn(),
}));

import { POST as guidedPost } from "@/app/api/guided/route";
import { getLessonsForLevel } from "@/lib/domain/lessons";

describe("POST /api/guided integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPersistProgress.mockResolvedValue(undefined);
  });

  it("rejects skipping ahead to a later lesson", async () => {
    const lessons = getLessonsForLevel("nivel-1");
    const secondLesson = lessons[1];
    expect(secondLesson).toBeDefined();

    mockResolveProgress.mockResolvedValue({
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
    });

    const response = await guidedPost(
      new Request("http://localhost/api/guided", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete-lesson",
          id: secondLesson!.id,
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Completa los pasos anteriores primero.",
    });
    expect(mockPersistProgress).not.toHaveBeenCalled();
  });
});
