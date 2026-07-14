"use client";

import { useState } from "react";
import type { LevelExam } from "@/lib/domain/lessons";
import { saveExamFromFormAction } from "@/app/admin/actions";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

interface ExamEditorProps {
  exam: LevelExam;
  levelName: string;
}

export function ExamEditor({ exam, levelName }: ExamEditorProps) {
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description);
  const [poolRaw, setPoolRaw] = useState(exam.poolExerciseIds.join(", "));
  const [questionsPerExam, setQuestionsPerExam] = useState(
    String(exam.questionsPerExam),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await saveExamFromFormAction(
      exam.levelId,
      title,
      description,
      poolRaw,
      Number(questionsPerExam),
    );

    setSaving(false);
    setOk(result.ok);
    setMessage(result.ok ? "Guardado" : result.error);
  }

  return (
    <CollapsiblePanel
      id={exam.levelId}
      title={levelName}
      subtitle={`Banco: ${exam.poolExerciseIds.length} · ${exam.questionsPerExam} por examen`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="text-gray-600">Título del examen</span>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Descripción</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Preguntas por examen</span>
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
            value={questionsPerExam}
            onChange={(event) => setQuestionsPerExam(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-gray-600">Banco de ejercicios (pool)</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
            rows={4}
            value={poolRaw}
            onChange={(event) => setPoolRaw(event.target.value)}
            placeholder="ej-n1-01, ej-n1-02"
          />
          <span className="mt-1 block text-xs text-gray-500">
            IDs separados por comas. Cada intento sortea N preguntas distintas.
          </span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <SaveFeedback message={message} ok={ok} />
        </div>
      </form>
    </CollapsiblePanel>
  );
}
