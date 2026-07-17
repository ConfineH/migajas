import { NextResponse } from "next/server";
import {
  completeLesson,
  completePracticeStep,
  completeFlashcards,
  toGuidedProgress,
  mergeGuidedIntoUserProgress,
} from "@/lib/domain/guided-flow";
import { validateGuidedAction } from "@/lib/domain/progress-integrity";
import { getLessonById } from "@/lib/domain/lessons";
import { buildLessonCompletedEvent } from "@/lib/domain/analytics";
import { trackLearningEvent } from "@/lib/analytics-server";
import { persistProgress, resolveProgress } from "@/lib/learning-state";

export async function POST(request: Request) {
  const body = await request.json();
  const { action, id } = body as {
    action: "complete-lesson" | "complete-practice" | "complete-flashcards";
    id: string;
  };

  const stored = await resolveProgress();
  let guided = toGuidedProgress(stored);

  if (action === "complete-lesson") {
    const gate = validateGuidedAction(guided, action, id);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }
    guided = completeLesson(guided, id);
    const lesson = getLessonById(id);
    if (lesson) {
      await trackLearningEvent(
        buildLessonCompletedEvent(lesson.id, lesson.levelId),
      );
    }
  } else if (action === "complete-practice") {
    const gate = validateGuidedAction(guided, action, id);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }
    guided = completePracticeStep(guided, id);
  } else if (action === "complete-flashcards") {
    const gate = validateGuidedAction(guided, action, id);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }
    guided = completeFlashcards(guided, id);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = mergeGuidedIntoUserProgress(stored, guided);
  const response = NextResponse.json({ ok: true, progress: updated });

  await persistProgress(updated, response);

  return response;
}
