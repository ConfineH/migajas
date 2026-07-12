import Link from "next/link";
import { getLevels, getExercisesForLevel } from "@/lib/domain/exercises";

export function LevelCard({
  id,
  name,
  description,
  exerciseCount,
}: {
  id: string;
  name: string;
  description: string;
  exerciseCount: number;
}) {
  return (
    <Link
      href={`/levels/${id}`}
      className="block rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:border-emerald-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{name}</h2>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {exerciseCount} ejercicios
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-600">Practicar →</p>
    </Link>
  );
}

export function LevelsList() {
  const levels = getLevels();

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <LevelCard
          key={level.id}
          id={level.id}
          name={level.name}
          description={level.description}
          exerciseCount={getExercisesForLevel(level.id).length}
        />
      ))}
    </div>
  );
}
