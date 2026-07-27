"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "@/lib/domain/exercises";
import { exerciseTypeLabels, getLevels } from "@/lib/domain/exercises";
import { AdminSearch } from "@/app/admin/AdminSearch";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";

interface ExerciseListProps {
  exercises: Exercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  const [query, setQuery] = useState("");
  const [levelId, setLevelId] = useState("Todos");

  const levels = useMemo(() => getLevels(), []);
  const levelNames = useMemo(
    () => Object.fromEntries(levels.map((level) => [level.id, level.name])),
    [levels],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesLevel = levelId === "Todos" || exercise.levelId === levelId;
      if (!matchesLevel) return false;
      if (!q) return true;
      return (
        exercise.id.toLowerCase().includes(q) ||
        exercise.prompt.toLowerCase().includes(q) ||
        (exercise.foodId?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [exercises, query, levelId]);

  return (
    <>
      <p className="mb-6 text-sm text-muted">
        Referencia de solo lectura. Los ejercicios viven en{" "}
        <code className="rounded bg-sage-light px-1">src/lib/data/exercises.json</code>{" "}
        y se referencian desde los exámenes.
      </p>

      <AdminSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar por id, prompt o foodId…"
        resultCount={filtered.length}
        totalCount={exercises.length}
      />

      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLevelId("Todos")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            levelId === "Todos"
              ? "bg-sage-strong text-white"
              : "bg-sage-light text-foreground hover:bg-sage/30"
          }`}
        >
          Todos
        </button>
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => setLevelId(level.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              levelId === level.id
                ? "bg-sage-strong text-white"
                : "bg-sage-light text-foreground hover:bg-sage/30"
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((exercise) => (
          <CollapsiblePanel
            key={exercise.id}
            id={exercise.id}
            title={exercise.id}
            subtitle={`${levelNames[exercise.levelId] ?? exercise.levelId} · ${exerciseTypeLabels[exercise.type]} · ${exercise.difficulty}`}
          >
            <div className="space-y-3 text-sm">
              <p className="text-foreground">{exercise.prompt}</p>
              <p className="text-muted">
                Respuesta correcta: <strong>{exercise.correctAnswer}</strong>
              </p>
              {exercise.foodId ? (
                <p className="text-muted">
                  Alimento vinculado: <code>{exercise.foodId}</code>
                </p>
              ) : null}
              <p className="text-muted">{exercise.explanation}</p>
              <ul className="space-y-1 text-muted">
                {exercise.options.map((option) => (
                  <li key={option.id}>
                    {option.label}
                    {option.isCorrect ? " ✓" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsiblePanel>
        ))}
      </div>
    </>
  );
}
