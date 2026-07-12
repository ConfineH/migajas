"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/Button";
import {
  exerciseTypeLabels,
  type Exercise,
} from "@/lib/domain/exercises";
import { PASS_THRESHOLD } from "@/lib/domain/progress";

interface ExamRunnerProps {
  exercises: Exercise[];
  levelId: string;
  levelName: string;
  nextLevelId?: string;
}

type Feedback = { isCorrect: boolean; explanation: string } | null;

export function ExamRunner({
  exercises,
  levelId,
  levelName,
  nextLevelId,
}: ExamRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [passed, setPassed] = useState(false);
  const [freeModeUnlocked, setFreeModeUnlocked] = useState(false);
  const startTime = useRef<number | null>(null);

  const exercise = exercises[index];
  const progressPct = ((index + (feedback ? 1 : 0)) / exercises.length) * 100;

  function getStartTime() {
    if (startTime.current === null) startTime.current = Date.now();
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

  async function finishExam(correct: number, total: number) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelId, correctCount: correct, totalCount: total }),
    });
    const data = await res.json();
    setPassed(data.completion.passed);
    setFreeModeUnlocked(levelId === "nivel-1" && data.completion.passed);
    setFinished(true);
  }

  function nextExercise() {
    if (index + 1 >= exercises.length) {
      finishExam(score.correct, score.total);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
    startTime.current = null;
  }

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
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
            Resultado del examen
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
              ? levelId === "nivel-1"
                ? "¡Aprobado! Modo libre desbloqueado: catálogo y práctica libre."
                : levelId === "nivel-5"
                  ? "¡Enhorabuena! Has completado todo el curso guiado."
                  : "¡Nivel aprobado! Puedes continuar al siguiente."
              : `Necesitas al menos ${PASS_THRESHOLD}%. Repasa las lecciones e inténtalo de nuevo.`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {passed && freeModeUnlocked && (
            <>
              <Button href="/catalog">Explorar catálogo</Button>
              <Button href="/levels" variant="secondary">
                Práctica libre
              </Button>
            </>
          )}
          {passed && nextLevelId && (
            <Button href={`/learn/${nextLevelId}`}>
              Siguiente nivel
            </Button>
          )}
          {!passed && (
            <Button href={`/learn/${levelId}`} variant="secondary">
              Repasar curso
            </Button>
          )}
          <Button href="/learn" variant="ghost">
            Todos los niveles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800">
        Examen — {levelName}
      </div>

      <div>
        <div className="mb-2 flex justify-between text-sm text-gray-500">
          <span>
            Pregunta {index + 1} de {exercises.length}
          </span>
          <span>{exerciseTypeLabels[exercise.type]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
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
            onClick={submitAnswer}
            className={
              !selected || submitting ? "opacity-50 pointer-events-none" : ""
            }
          >
            {submitting ? "Comprobando…" : "Comprobar"}
          </Button>
        ) : (
          <Button onClick={nextExercise}>
            {index + 1 >= exercises.length ? "Ver resultado" : "Siguiente"}
          </Button>
        )}
      </div>
    </div>
  );
}
