"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/lib/domain/lessons";
import Link from "next/link";
import { AdminSearch } from "@/app/admin/AdminSearch";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";
import { LessonEditor } from "@/app/admin/lessons/LessonEditor";

interface LessonListProps {
  lessons: Lesson[];
  levelNames: Record<string, string>;
}

export function LessonList({ lessons, levelNames }: LessonListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(q) ||
        lesson.id.toLowerCase().includes(q) ||
        lesson.levelId.toLowerCase().includes(q) ||
        lesson.summary.toLowerCase().includes(q),
    );
  }, [lessons, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const lesson of filtered) {
      const group = map.get(lesson.levelId) ?? [];
      group.push(lesson);
      map.set(lesson.levelId, group);
    }
    for (const group of map.values()) {
      group.sort((a, b) => a.orderIndex - b.orderIndex);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <>
      <AdminSearch
        value={query}
        onChange={setQuery}
        placeholder="Buscar lección por título, id o nivel…"
        resultCount={filtered.length}
        totalCount={lessons.length}
      />

      <div className="space-y-8">
        {grouped.map(([levelId, levelLessons]) => (
          <section key={levelId} className="space-y-4">
            <h2 className="font-display text-lg font-medium text-foreground">
              {levelNames[levelId] ?? levelId}
            </h2>
            {levelLessons.map((lesson) => (
              <CollapsiblePanel
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                subtitle={`${lesson.id} · ${lesson.steps.length} pasos`}
              >
                <LessonEditor lesson={lesson} />
                <Link
                  href={`/admin/lessons/${lesson.id}`}
                  className="mt-4 inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
                >
                  Editar pasos →
                </Link>
              </CollapsiblePanel>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
