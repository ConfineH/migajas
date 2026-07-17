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

const inputClass = "field-input mt-1 text-sm";

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
          <span className="text-muted">Título del examen</span>
          <input
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Descripción</span>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Preguntas por examen</span>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={questionsPerExam}
            onChange={(event) => setQuestionsPerExam(event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Banco de ejercicios (pool)</span>
          <textarea
            className={`${inputClass} font-mono text-xs`}
            rows={4}
            value={poolRaw}
            onChange={(event) => setPoolRaw(event.target.value)}
            placeholder="ej-n1-01, ej-n1-02"
          />
          <span className="mt-1 block text-xs text-muted">
            IDs separados por comas. Cada intento sortea N preguntas distintas.
          </span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-terracotta rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <SaveFeedback message={message} ok={ok} />
        </div>
      </form>
    </CollapsiblePanel>
  );
}
