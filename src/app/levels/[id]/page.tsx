import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import {
  getLevelById,
  getExercisesForLevel,
} from "@/lib/domain/exercises";

interface LevelPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LevelPageProps) {
  const { id } = await params;
  const level = getLevelById(id);
  return { title: level ? `${level.name} — Migajas` : "Nivel — Migajas" };
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { id } = await params;
  const level = getLevelById(id);
  if (!level) notFound();

  const exercises = getExercisesForLevel(id);
  if (exercises.length === 0) notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-emerald-600">
            {level.country}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{level.name}</h1>
          <p className="mt-2 text-gray-600">{level.description}</p>
        </header>
        <ExerciseRunner exercises={exercises} levelName={level.name} />
      </main>
    </>
  );
}
