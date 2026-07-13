import { NextResponse } from "next/server";
import { gradeAnswer, getExerciseById } from "@/lib/domain/exercises";
import { recordAttempt } from "@/lib/domain/attempts";
import { persistAttempts, resolveAttempts } from "@/lib/learning-state";

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

  const isCorrect = gradeAnswer(exercise, selectedAnswer);
  const existing = await resolveAttempts();
  const updated = recordAttempt(existing, {
    exerciseId,
    selectedAnswer,
    isCorrect,
    timeSpentMs,
  });

  const response = NextResponse.json({
    isCorrect,
    explanation: exercise.explanation,
    correctAnswer: exercise.correctAnswer,
  });

  await persistAttempts(updated, response);

  return response;
}
