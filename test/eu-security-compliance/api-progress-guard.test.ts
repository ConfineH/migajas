import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResolveProgress = vi.fn();
const mockResolveAttempts = vi.fn();
const mockPersistProgress = vi.fn();

vi.mock("@/lib/learning-state", () => ({
  resolveProgress: (...args: unknown[]) => mockResolveProgress(...args),
  resolveAttempts: (...args: unknown[]) => mockResolveAttempts(...args),
  persistProgress: (...args: unknown[]) => mockPersistProgress(...args),
}));

vi.mock("@/lib/analytics-server", () => ({
  trackLearningEvent: vi.fn(),
}));

import { POST as progressPost } from "@/app/api/progress/route";

describe("POST /api/progress integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPersistProgress.mockResolvedValue(undefined);
  });

  it("rejects fake nivel-3 completion without exam attempts", async () => {
    mockResolveProgress.mockResolvedValue({
      completions: [],
      completedLessons: [],
      completedPracticeSteps: [],
      freeModeUnlocked: false,
      activeExamSessions: [
        {
          levelId: "nivel-3",
          exerciseIds: ["ex-a", "ex-b", "ex-c", "ex-d"],
          startedAt: "2026-07-17T10:00:00.000Z",
          inProgress: true,
        },
      ],
    });
    mockResolveAttempts.mockResolvedValue([]);

    const response = await progressPost(
      new Request("http://localhost/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId: "nivel-3",
          correctCount: 4,
          totalCount: 4,
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Completa todas las preguntas del examen.",
    });
    expect(mockPersistProgress).not.toHaveBeenCalled();
  });
});
