import { NextResponse } from "next/server";
import {
  completeLesson,
  completePracticeStep,
  toGuidedProgress,
  mergeGuidedIntoUserProgress,
} from "@/lib/domain/guided-flow";
import { getLessonById } from "@/lib/domain/lessons";
import { buildLessonCompletedEvent } from "@/lib/domain/analytics";
import { trackLearningEvent } from "@/lib/analytics-server";
import { persistProgress, resolveProgress } from "@/lib/learning-state";

export async function POST(request: Request) {
  const body = await request.json();
  const { action, id } = body as {
    action: "complete-lesson" | "complete-practice";
    id: string;
  };

  const stored = await resolveProgress();
  let guided = toGuidedProgress(stored);

  if (action === "complete-lesson") {
    guided = completeLesson(guided, id);
    const lesson = getLessonById(id);
    if (lesson) {
      await trackLearningEvent(
        buildLessonCompletedEvent(lesson.id, lesson.levelId),
      );
    }
  } else if (action === "complete-practice") {
    guided = completePracticeStep(guided, id);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = mergeGuidedIntoUserProgress(stored, guided);
  const response = NextResponse.json({ ok: true, progress: updated });

  await persistProgress(updated, response);

  return response;
}
