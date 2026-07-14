import { NextResponse } from "next/server";
import { completeLevel } from "@/lib/domain/progress";
import { clearExamSession } from "@/lib/domain/exam-session";
import {
  buildExamPassedEvent,
  buildFreeModeUnlockedEvent,
  shouldEmitExamPassed,
  shouldEmitFreeModeUnlocked,
} from "@/lib/domain/analytics";
import { trackLearningEvent } from "@/lib/analytics-server";
import { persistProgress, resolveProgress } from "@/lib/learning-state";
import { getLevelById } from "@/lib/domain/exercises";

export async function GET() {
  const progress = await resolveProgress();
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { levelId, correctCount, totalCount } = body as {
    levelId: string;
    correctCount: number;
    totalCount: number;
  };

  const level = getLevelById(levelId);
  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  const existing = await resolveProgress();
  const wasFreeModeUnlocked = existing.freeModeUnlocked;
  const clearedSessions = clearExamSession(existing.activeExamSessions, levelId);
  const updated = completeLevel(
    { ...existing, activeExamSessions: clearedSessions },
    levelId,
    correctCount,
    totalCount,
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
