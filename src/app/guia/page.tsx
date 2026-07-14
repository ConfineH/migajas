import { AppNavBar } from "@/components/AppNavBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceGuideClient } from "@/components/reference-guide/ReferenceGuideClient";
import { getFoods } from "@/lib/data/foods";
import { enrichFoods } from "@/lib/domain/foods";
import { requireOnboarding } from "@/lib/onboarding";

export const metadata = {
  title: "Guía de referencia — Migajas",
};

export default async function ReferenceGuidePage() {
  await requireOnboarding();
  const foods = enrichFoods(getFoods());

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Guía de referencia"
          description="Reglas, tabla de conversión, alimentos y calculadora para consultar durante el curso."
        />
        <ReferenceGuideClient foods={foods} />
      </main>
    </>
  );
}
