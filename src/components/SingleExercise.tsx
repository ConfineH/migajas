"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { gradeAnswer, type Exercise } from "@/lib/domain/exercises";

interface SingleExerciseProps {
  exercise: Exercise;
  practiceStepId: string;
  returnHref: string;
}

export function SingleExercise({
  exercise,
  practiceStepId,
  returnHref,
}: SingleExerciseProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef<number | null>(null);

  function getStartTime() {
    if (startTime.current === null) startTime.current = Date.now();
    return startTime.current;
  }

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    const timeSpentMs = Date.now() - getStartTime();

    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        selectedAnswer: selected,
        timeSpentMs,
      }),
    });

    const isCorrect = gradeAnswer(exercise, selected);
    setFeedback({ isCorrect, explanation: exercise.explanation });
    setSubmitting(false);
  }

  async function completePractice() {
    await fetch("/api/guided", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete-practice",
        id: practiceStepId,
      }),
    });
    router.push(returnHref);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
        Práctica ligada a la lección
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{exercise.prompt}</h2>

        {!feedback && (
          <ul className="mt-6 space-y-3">
            {exercise.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className={`w-full rounded-xl border-2 px-4 py-4 text-left font-medium transition-colors ${
                    selected === option.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        {feedback && (
          <div
            className={`mt-6 rounded-xl p-5 ${
              feedback.isCorrect
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-lg font-bold ${
                feedback.isCorrect ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {feedback.isCorrect ? "¡Correcto!" : "Incorrecto"}
            </p>
            <p className="mt-2 text-gray-700">{feedback.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {!feedback ? (
          <Button
            onClick={submit}
            className={!selected || submitting ? "opacity-50 pointer-events-none" : ""}
          >
            Comprobar
          </Button>
        ) : (
          <Button onClick={completePractice}>Continuar el curso</Button>
        )}
      </div>
    </div>
  );
}
