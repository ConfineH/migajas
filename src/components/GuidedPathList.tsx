import Link from "next/link";
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
    <ol className="space-y-3">
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
            <li key={item.id}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 transition-colors hover:border-emerald-300 hover:bg-emerald-100/80"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-medium text-emerald-800">{item.title}</p>
                  <p className="text-xs text-emerald-700/80">Completado</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  {revisitLabel} →
                </span>
              </Link>
            </li>
          );
        }

        return (
          <li key={item.id}>
            {locked ? (
              <div
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 opacity-60"
                aria-disabled="true"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    Completa los pasos anteriores primero
                  </p>
                </div>
              </div>
            ) : (
              <Link
                href={href}
                className="flex items-center gap-4 rounded-2xl border border-emerald-300 bg-white px-5 py-4 shadow-sm transition-colors hover:border-emerald-400"
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{typeLabel}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  Continuar →
                </span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
