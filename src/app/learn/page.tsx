import { AppNavBar } from "@/components/AppNavBar";
import { CourseLevelList } from "@/components/CourseLevelList";
import { resolveProgress } from "@/lib/learning-state";
import { toGuidedProgress, isFreeModeUnlocked } from "@/lib/domain/guided-flow";
import Link from "next/link";

export const metadata = {
  title: "Curso guiado — Migajas",
};

export default async function LearnPage() {
  const stored = await resolveProgress();
  const progress = toGuidedProgress(stored);
  const freeMode = isFreeModeUnlocked(progress);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Curso guiado</h1>
          <p className="mt-2 text-gray-600">
            Cinco niveles con lecciones, práctica y examen. Avanza paso a paso.
          </p>
        </header>

        {freeMode && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-800">Modo libre activo</p>
            <p className="mt-1 text-sm text-emerald-700">
              Puedes consultar el{" "}
              <Link href="/catalog" className="font-semibold underline">
                catálogo
              </Link>{" "}
              y la{" "}
              <Link href="/levels" className="font-semibold underline">
                práctica libre
              </Link>{" "}
              cuando quieras.
            </p>
          </div>
        )}

        <CourseLevelList progress={progress} />
      </main>
    </>
  );
}
