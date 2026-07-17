import { NextResponse } from "next/server";
import { completeLevel } from "@/lib/domain/progress";
import { clearExamSession } from "@/lib/domain/exam-session";
import { getExercisesForLevel, getLevelById } from "@/lib/domain/exercises";
import { validateLevelCompletion } from "@/lib/domain/progress-integrity";
import {
  buildExamPassedEvent,
  buildFreeModeUnlockedEvent,
  shouldEmitExamPassed,
  shouldEmitFreeModeUnlocked,
} from "@/lib/domain/analytics";
import { trackLearningEvent } from "@/lib/analytics-server";
import { persistProgress, resolveAttempts, resolveProgress } from "@/lib/learning-state";

export async function GET() {
  const progress = await resolveProgress();
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { levelId } = body as {
    levelId: string;
    correctCount?: number;
    totalCount?: number;
  };

  const level = getLevelById(levelId);
  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  const existing = await resolveProgress();
  const attempts = await resolveAttempts();
  const validation = validateLevelCompletion(
    existing,
    attempts,
    levelId,
    getExercisesForLevel(levelId).map((exercise) => exercise.id),
  );
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  const wasFreeModeUnlocked = existing.freeModeUnlocked;
  const clearedSessions = clearExamSession(existing.activeExamSessions, levelId);
  const updated = completeLevel(
    { ...existing, activeExamSessions: clearedSessions },
    levelId,
    validation.correct,
    validation.total,
  );
  const completion = updated.completions.find((c) => c.levelId === levelId)!;

  if (shouldEmitExamPassed(completion.passed)) {
    await trackLearningEvent(
      buildExamPassedEvent(levelId, completion.masteryScore),
    );
  }
  if (
    shouldEmitFreeModeUnlocked(
      levelId,
      completion.passed,
      wasFreeModeUnlocked,
    )
  ) {
    await trackLearningEvent(buildFreeModeUnlockedEvent());
  }

  const response = NextResponse.json({
    completion,
    nextLevelUnlocked: completion.passed,
  });

  await persistProgress(updated, response);

  return response;
}
