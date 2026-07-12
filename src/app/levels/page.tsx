import { NavBar } from "@/components/NavBar";
import { LevelsList } from "@/components/LevelsList";
import { getStoredProgress } from "@/lib/progress-storage";
import { getStoredAttempts } from "@/lib/attempts-storage";

export const metadata = {
  title: "Practicar — Migajas",
};

export default async function LevelsPage() {
  const progress = await getStoredProgress();
  const attempts = await getStoredAttempts();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Practicar</h1>
          <p className="mt-2 text-gray-600">
            Avanza por niveles. Necesitas al menos 60% de aciertos para
            desbloquear el siguiente.
          </p>
        </header>
        <LevelsList progress={progress} attempts={attempts} />
      </main>
    </>
  );
}
