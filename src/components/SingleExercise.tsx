"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Exercise } from "@/lib/domain/exercises";

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

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        selectedAnswer: selected,
        timeSpentMs,
      }),
    });

    const data = await res.json();
    setFeedback({
      isCorrect: Boolean(data.isCorrect),
      explanation: data.explanation ?? exercise.explanation,
    });
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

  function retry() {
    setSelected(null);
    setFeedback(null);
    startTime.current = null;
  }

  return (
    <div className="space-y-6">
      <div className="callout-sage text-sm font-medium text-foreground">
        Práctica ligada a la lección
      </div>

      <div className="feature-card p-6">
        <h2 className="font-display text-xl font-medium text-foreground">
          {exercise.prompt}
        </h2>

        {!feedback ? (
          <ul className="mt-6 space-y-3">
            {exercise.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className={`choice-button ${
                    selected === option.value ? "choice-button-selected" : ""
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {feedback ? (
          <div
            className={
              feedback.isCorrect ? "feedback-correct mt-6" : "feedback-wrong mt-6"
            }
          >
            <p
              className={`text-lg font-medium ${
                feedback.isCorrect ? "text-sage-strong" : "text-red-700"
              }`}
            >
              {feedback.isCorrect ? "Correcto" : "Incorrecto"}
            </p>
            <p className="mt-2 text-muted">{feedback.explanation}</p>
            {!feedback.isCorrect ? (
              <p className="mt-3 text-sm text-red-800">
                Repasa la explicación e inténtalo de nuevo para continuar.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        {!feedback ? (
          <Button
            onClick={submit}
            className={!selected || submitting ? "opacity-50 pointer-events-none" : ""}
          >
            Comprobar
          </Button>
        ) : feedback.isCorrect ? (
          <Button onClick={completePractice}>Continuar el curso</Button>
        ) : (
          <Button onClick={retry} variant="secondary">
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
