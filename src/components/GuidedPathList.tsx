"use client";

import Link from "next/link";
import StaggeredList from "@/components/react-bits/StaggeredList";
import {
  buildGuidedSequence,
  isGuidedItemComplete,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";

interface GuidedPathListProps {
  levelId: string;
  progress: GuidedProgress;
}

const typeIcons: Record<string, string> = {
  lesson: "📖",
  practice: "✏️",
  flashcards: "🃏",
  exam: "🎯",
};

function itemHref(levelId: string, item: { type: string; id: string }, examHref: string) {
  if (item.type === "lesson") return `/learn/${levelId}/lessons/${item.id}`;
  if (item.type === "practice") return `/learn/${levelId}/practice/${item.id}`;
  if (item.type === "flashcards") return `/learn/${levelId}/fichas`;
  return examHref;
}

export function GuidedPathList({ levelId, progress }: GuidedPathListProps) {
  const sequence = buildGuidedSequence(levelId);

  return (
    <StaggeredList className="space-y-3" itemClassName="list-none">
      {sequence.map((item, index) => {
        const done = isGuidedItemComplete(progress, item, levelId);
        const isNext =
          !done &&
          sequence
            .slice(0, index)
            .every((prev) => isGuidedItemComplete(progress, prev, levelId));

        const completion = progress.levelCompletions.find(
          (entry) => entry.levelId === levelId,
        );
        const examHref = completion?.passed
          ? `/learn/${levelId}/exam?nuevo=1`
          : `/learn/${levelId}/exam`;

        const href = itemHref(levelId, item, examHref);
        const locked = !done && !isNext;
        const revisitLabel =
          item.type === "lesson"
            ? "Releer"
            : item.type === "practice"
              ? "Repetir práctica"
              : item.type === "flashcards"
                ? "Repasar fichas"
                : "Repetir examen";

        const typeLabel =
          item.type === "flashcards" ? "fichas" : item.type;

        if (done) {
          return (
            <div key={item.id}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-2xl bg-sage-light/80 px-5 py-4 transition-all duration-200 hover:bg-sage-light"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-medium text-sage-strong">{item.title}</p>
                  <p className="text-xs text-muted">Completado</p>
                </div>
                <span className="text-sm font-medium text-sage-strong">
                  {revisitLabel} →
                </span>
              </Link>
            </div>
          );
        }

        return (
          <div key={item.id}>
            {locked ? (
              <div
                className="callout-muted flex items-center gap-4 px-5 py-4"
                aria-disabled="true"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted">
                    Completa los pasos anteriores primero
                  </p>
                </div>
              </div>
            ) : (
              <Link
                href={href}
                className="card-interactive flex items-center gap-4 px-5 py-4"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs capitalize text-muted">{typeLabel}</p>
                </div>
                <span className="text-sm font-medium text-sage-strong">
                  Continuar →
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </StaggeredList>
  );
}
