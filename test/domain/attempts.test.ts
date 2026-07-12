import { describe, it, expect } from "vitest";
import {
  recordAttempt,
  getAttempts,
  getAttemptsForExercise,
  type Attempt,
} from "@/lib/domain/attempts";

const baseAttempt: Omit<Attempt, "createdAt"> = {
  exerciseId: "ex-1",
  selectedAnswer: "1.5",
  isCorrect: true,
  timeSpentMs: 3200,
};

describe("recordAttempt", () => {
  it("appends attempt with timestamp", () => {
    const attempts = recordAttempt([], baseAttempt);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].exerciseId).toBe("ex-1");
    expect(attempts[0].createdAt).toBeTruthy();
  });
});

describe("getAttemptsForExercise", () => {
  it("filters attempts by exercise id", () => {
    const attempts: Attempt[] = [
      { ...baseAttempt, createdAt: "2026-01-01T00:00:00Z" },
      {
        ...baseAttempt,
        exerciseId: "ex-2",
        createdAt: "2026-01-01T00:01:00Z",
      },
    ];
    expect(getAttemptsForExercise(attempts, "ex-1")).toHaveLength(1);
  });
});

describe("getAttempts", () => {
  it("returns recent attempts first", () => {
    const older: Attempt = {
      ...baseAttempt,
      createdAt: "2026-01-01T00:00:00Z",
    };
    const newer: Attempt = {
      ...baseAttempt,
      exerciseId: "ex-2",
      createdAt: "2026-01-02T00:00:00Z",
    };
    const sorted = getAttempts([older, newer]);
    expect(sorted[0].exerciseId).toBe("ex-2");
  });
});
