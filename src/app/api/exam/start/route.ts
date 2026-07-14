import { NextResponse } from "next/server";
import { getExamForLevel } from "@/lib/domain/lessons";
import {
  buildExamSession,
  clearExamSession,
  getResumableExamSession,
  normalizeExamConfig,
} from "@/lib/domain/exam-session";
import { persistProgress, resolveProgress } from "@/lib/learning-state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const levelId = url.searchParams.get("levelId");
  const forceNew = url.searchParams.get("nuevo") === "1";

  if (!levelId) {
    return NextResponse.json({ error: "levelId required" }, { status: 400 });
  }

  const exam = getExamForLevel(levelId);
  if (!exam) {
    return NextResponse.redirect(new URL(`/learn/${levelId}`, request.url));
  }

  const config = normalizeExamConfig(exam);
  let progress = await resolveProgress();

  if (forceNew) {
    progress = {
      ...progress,
      activeExamSessions: clearExamSession(progress.activeExamSessions, levelId),
    };
  }

  const existing = getResumableExamSession(progress.activeExamSessions, levelId);
  if (existing) {
    return NextResponse.redirect(new URL(`/learn/${levelId}/exam`, request.url));
  }

  try {
    const session = buildExamSession(
      levelId,
      config.poolExerciseIds,
      config.questionsPerExam,
    );
    const updated = {
      ...progress,
      activeExamSessions: [
        ...clearExamSession(progress.activeExamSessions, levelId),
        session,
      ],
    };

    const redirectUrl = new URL(`/learn/${levelId}/exam`, request.url);
    const response = NextResponse.redirect(redirectUrl);
    await persistProgress(updated, response);
    return response;
  } catch {
    return NextResponse.redirect(new URL(`/learn/${levelId}`, request.url));
  }
}
