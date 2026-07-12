import { AppNavBar } from "@/components/AppNavBar";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export const metadata = {
  title: "Configuración — Migajas",
};

export default function OnboardingPage() {
  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <OnboardingFlow />
      </main>
    </>
  );
}
