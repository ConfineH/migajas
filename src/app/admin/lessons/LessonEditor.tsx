"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/domain/lessons";
import { saveLessonAction } from "@/app/admin/actions";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

interface LessonEditorProps {
  lesson: Lesson;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm";

export function LessonEditor({ lesson }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await saveLessonAction({
      id: lesson.id,
      title,
      summary,
    });

    setSaving(false);
    setOk(result.ok);
    setMessage(result.ok ? "Guardado" : result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="text-gray-600">Título</span>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block text-sm">
        <span className="text-gray-600">Resumen</span>
        <textarea className={inputClass} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
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
  );
}
