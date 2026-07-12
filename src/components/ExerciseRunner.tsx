"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/Button";
import {
  exerciseTypeLabels,
  type Exercise,
} from "@/lib/domain/exercises";
import { PASS_THRESHOLD } from "@/lib/domain/progress";

interface ExerciseRunnerProps {
  exercises: Exercise[];
  levelId: string;
  levelName: string;
  retryMode?: boolean;
}

type Feedback = {
  isCorrect: boolean;
  explanation: string;
} | null;

type CompletionResult = {
  passed: boolean;
  masteryScore: number;
} | null;

export function ExerciseRunner({
  exercises,
  levelId,
  levelName,
  retryMode = false,
}: ExerciseRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [completion, setCompletion] = useState<CompletionResult>(null);
  const startTime = useRef<number | null>(null);

  const exercise = exercises[index];
  const progress = ((index + (feedback ? 1 : 0)) / exercises.length) * 100;

  function getStartTime(): number {
    if (startTime.current === null) {
      startTime.current = Date.now();
    }
    return startTime.current;
  }

  async function submitAnswer() {
    if (!selected || !exercise) return;
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
    setFeedback({ isCorrect: data.isCorrect, explanation: data.explanation });
    setScore((s) => ({
      correct: s.correct + (data.isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setSubmitting(false);
  }

  async function finishLevel(correct: number, total: number) {
    if (!retryMode) {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId,
          correctCount: correct,
          totalCount: total,
        }),
      });
      const data = await res.json();
      setCompletion({
        passed: data.completion.passed,
        masteryScore: data.completion.masteryScore,
      });
    } else {
      const masteryScore = Math.round((correct / total) * 100);
      setCompletion({ passed: masteryScore >= PASS_THRESHOLD, masteryScore });
    }
    setFinished(true);
  }

  function nextExercise() {
    if (index + 1 >= exercises.length) {
      finishLevel(score.correct, score.total);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
    startTime.current = null;
  }

  if (finished && completion) {
    const pct = completion.masteryScore;
    const passed = completion.passed;
    const nextLevelNum = parseInt(levelId.replace("nivel-", ""), 10) + 1;
    const hasNext = nextLevelNum <= 5 && passed;

    return (
      <div className="space-y-6 text-center">
        <div
          className={`rounded-2xl border p-8 ${
            passed
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
            {retryMode ? "Repaso completado" : `${levelName} completado`}
          </p>
          <p
            className={`mt-4 text-5xl font-bold ${
              passed ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {score.correct}/{score.total}
          </p>
          <p className="mt-2 text-lg text-gray-600">{pct}% de aciertos</p>
          <p className="mt-4 text-sm font-medium text-gray-700">
            {passed
              ? "¡Nivel aprobado! Puedes continuar al siguiente."
              : `Necesitas al menos ${PASS_THRESHOLD}% para desbloquear el siguiente nivel.`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {hasNext && (
            <Button href={`/levels/nivel-${nextLevelNum}`}>
              Siguiente nivel
            </Button>
          )}
          {!passed && (
            <Button href={`/levels/${levelId}?retry=1`} variant="secondary">
              Repasar errores
            </Button>
          )}
          <Button href="/progress" variant={hasNext || !passed ? "ghost" : "primary"}>
            Ver progreso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {retryMode && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          Modo repaso — solo ejercicios fallados
        </p>
      )}

      <div>
        <div className="mb-2 flex justify-between text-sm text-gray-500">
          <span>
            Ejercicio {index + 1} de {exercises.length}
          </span>
          <span>{exerciseTypeLabels[exercise.type]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 leading-snug">
          {exercise.prompt}
        </h2>

        {!feedback && (
          <ul className="mt-6 space-y-3" role="listbox" aria-label="Opciones">
            {exercise.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected === option.value}
                  onClick={() => setSelected(option.value)}
                  className={`w-full rounded-xl border-2 px-4 py-4 text-left text-base font-medium transition-colors ${
                    selected === option.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-gray-200 hover:border-emerald-200 text-gray-800"
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
            role="status"
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
            onClick={submitAnswer}
            className={
              !selected || submitting ? "opacity-50 pointer-events-none" : ""
            }
          >
            {submitting ? "Comprobando…" : "Comprobar"}
          </Button>
        ) : (
          <Button onClick={nextExercise}>
            {index + 1 >= exercises.length ? "Ver resultados" : "Siguiente"}
          </Button>
        )}
      </div>
    </div>
  );
}
