import { describe, it, expect } from "vitest";
import {
  buildExamSession,
  clearExamSession,
  getResumableExamSession,
  shuffleExerciseIds,
  upsertExamSession,
} from "@/lib/domain/exam-session";

describe("exam-session", () => {
  const pool = ["a", "b", "c", "d", "e", "f", "g", "h"];

  it("draws unique exercises from pool", () => {
    const ids = shuffleExerciseIds(pool, 4, () => 0.1);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it("rejects pool smaller than draw count", () => {
    expect(() => shuffleExerciseIds(["a", "b"], 4, () => 0.5)).toThrow(
      "POOL_TOO_SMALL",
    );
  });

  it("resumes in-progress session", () => {
    const session = buildExamSession("nivel-1", pool, 4, () => 0.2, () => "t1");
    const sessions = upsertExamSession([], session);
    expect(getResumableExamSession(sessions, "nivel-1")?.exerciseIds).toEqual(
      session.exerciseIds,
    );
  });

  it("clears session after exam completes", () => {
    const session = buildExamSession("nivel-1", pool, 4);
    const sessions = upsertExamSession([], session);
    expect(clearExamSession(sessions, "nivel-1")).toEqual([]);
  });
});
