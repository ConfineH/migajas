import { AppNavBar } from "@/components/AppNavBar";
import { CatalogClient } from "@/components/CatalogClient";
import { getFoods } from "@/lib/data/foods";
import { enrichFoods } from "@/lib/domain/foods";
import { requireFreeMode } from "@/lib/free-mode";

export const metadata = {
  title: "Catálogo — Migajas",
};

export default async function CatalogPage() {
  await requireFreeMode();
  const foods = enrichFoods(getFoods());

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo de alimentos
          </h1>
          <p className="mt-2 text-gray-600">
            Alimentos habituales en España. Cada ficha muestra la porción, los
            gramos, los carbohidratos y las raciones.
          </p>
        </header>
        <CatalogClient foods={foods} />
      </main>
    </>
  );
}
