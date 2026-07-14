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
  exam: "🎯",
};

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
        const examHref = completion
          ? `/learn/${levelId}/exam?nuevo=1`
          : `/learn/${levelId}/exam`;

        const href =
          item.type === "lesson"
            ? `/learn/${levelId}/lessons/${item.id}`
            : item.type === "practice"
              ? `/learn/${levelId}/practice/${item.id}`
              : examHref;

        return (
          <li key={item.id}>
            {done ? (
              <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-medium text-emerald-800 line-through opacity-70">
                    {item.title}
                  </p>
                </div>
                <span className="text-emerald-600 font-bold">✓</span>
              </div>
            ) : (
              <Link
                href={isNext ? href : "#"}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors ${
                  isNext
                    ? "border-emerald-300 bg-white shadow-sm hover:border-emerald-400"
                    : "border-gray-200 bg-gray-50 opacity-60 pointer-events-none"
                }`}
              >
                <span className="text-xl">{typeIcons[item.type]}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </div>
                {isNext && (
                  <span className="text-sm font-semibold text-emerald-600">
                    Continuar →
                  </span>
                )}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
