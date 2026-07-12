import { NavBar } from "@/components/NavBar";
import { LevelsList } from "@/components/LevelsList";

export const metadata = {
  title: "Practicar — Migajas",
};

export default function LevelsPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Practicar</h1>
          <p className="mt-2 text-gray-600">
            Ejercicios interactivos para aprender a contar carbohidratos. Recibirás
            feedback inmediato en cada respuesta.
          </p>
        </header>
        <LevelsList />
      </main>
    </>
  );
}
