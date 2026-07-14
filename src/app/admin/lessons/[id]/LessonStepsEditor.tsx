"use client";

import { useState } from "react";
import type { Lesson, LessonStep } from "@/lib/domain/lessons";
import { saveLessonStepsAction } from "@/app/admin/actions";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

interface LessonStepsEditorProps {
  lesson: Lesson;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm";

const stepTypeLabels: Record<LessonStep["type"], string> = {
  explanation: "Explicación",
  example: "Ejemplo",
  practice: "Práctica",
};

export function LessonStepsEditor({ lesson }: LessonStepsEditorProps) {
  const [steps, setSteps] = useState<LessonStep[]>(lesson.steps);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateStep(index: number, patch: Partial<LessonStep>) {
    setSteps((current) =>
      current.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await saveLessonStepsAction({
      id: lesson.id,
      steps,
    });

    setSaving(false);
    setOk(result.ok);
    setMessage(result.ok ? "Pasos guardados" : result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {steps.map((step, index) => (
        <section
          key={step.id}
          className="rounded-xl border border-gray-100 bg-gray-50 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">
              Paso {index + 1}: {stepTypeLabels[step.type]}
            </p>
            <span className="font-mono text-xs text-gray-400">{step.id}</span>
          </div>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="text-gray-600">Título</span>
              <input
                className={inputClass}
                value={step.title}
                onChange={(event) =>
                  updateStep(index, { title: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">Contenido</span>
              <textarea
                className={inputClass}
                rows={4}
                value={step.body}
                onChange={(event) =>
                  updateStep(index, { body: event.target.value })
                }
              />
            </label>
            {step.type === "practice" ? (
              <p className="text-xs text-gray-500">
                Ejercicio vinculado: {step.exerciseId ?? "—"}
              </p>
            ) : null}
            {step.type === "example" ? (
              <p className="text-xs text-gray-500">
                Alimento vinculado: {step.foodId ?? "—"}
              </p>
            ) : null}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar pasos"}
        </button>
        <SaveFeedback message={message} ok={ok} />
      </div>
    </form>
  );
}
