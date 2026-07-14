import { NextResponse } from "next/server";
import { gradeAnswer, getExerciseById } from "@/lib/domain/exercises";
import { recordAttempt } from "@/lib/domain/attempts";
import { persistAttempts, resolveAttempts } from "@/lib/learning-state";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { localizeExercise } from "@/lib/domain/content-localization";

export async function GET() {
  const attempts = await resolveAttempts();
  return NextResponse.json({ attempts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { exerciseId, selectedAnswer, timeSpentMs } = body as {
    exerciseId: string;
    selectedAnswer: string;
    timeSpentMs: number;
  };

  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const { region, foods } = await getRegionalContentContext();
  const localizedExercise = localizeExercise(exercise, region, foods);

  const isCorrect = gradeAnswer(localizedExercise, selectedAnswer);
  const existing = await resolveAttempts();
  const updated = recordAttempt(existing, {
    exerciseId,
    selectedAnswer,
    isCorrect,
    timeSpentMs,
  });

  const response = NextResponse.json({
    isCorrect,
    explanation: localizedExercise.explanation,
    correctAnswer: localizedExercise.correctAnswer,
  });

  await persistAttempts(updated, response);

  return response;
}
