"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type Step = "country" | "mode" | "rations";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("country");
  const [guestMode, setGuestMode] = useState(true);

  async function completeOnboarding() {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: "España",
        guestMode,
        completed: true,
      }),
    });
    router.push("/learn/nivel-1");
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {step === "country" && (
        <section className="space-y-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            ¿Dónde vas a practicar?
          </h1>
          <p className="text-gray-600">
            Migajas empieza con alimentos y platos habituales en España.
          </p>
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6">
            <p className="text-3xl">🇪🇸</p>
            <p className="mt-2 text-xl font-semibold text-emerald-800">
              España
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              10 g de carbohidratos = 1 ración
            </p>
          </div>
          <Button onClick={() => setStep("mode")}>Continuar</Button>
        </section>
      )}

      {step === "mode" && (
        <section className="space-y-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            ¿Cómo quieres empezar?
          </h1>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setGuestMode(true)}
              className={`w-full rounded-2xl border-2 p-5 text-left transition-colors ${
                guestMode
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <p className="font-semibold text-gray-900">Modo invitado</p>
              <p className="mt-1 text-sm text-gray-600">
                Empieza al momento, sin registrarte.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setGuestMode(false)}
              className={`w-full rounded-2xl border-2 p-5 text-left transition-colors ${
                !guestMode
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <p className="font-semibold text-gray-900">Crear cuenta</p>
              <p className="mt-1 text-sm text-gray-600">
                Próximamente — por ahora usa modo invitado.
              </p>
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setStep("country")}>
              Atrás
            </Button>
            <Button onClick={() => setStep("rations")}>Continuar</Button>
          </div>
        </section>
      )}

      {step === "rations" && (
        <section className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            ¿Qué es una ración?
          </h1>
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 space-y-4">
            <p className="text-gray-800">
              En España, una <strong>ración</strong> equivale a{" "}
              <strong>10 gramos de carbohidratos</strong>.
            </p>
            <div className="rounded-xl bg-white p-4 text-center">
              <p className="text-sm text-gray-500">Ejemplo</p>
              <p className="mt-1 text-lg font-semibold">
                1 rebanada de pan blanco
              </p>
              <p className="text-gray-600">25 g de alimento · 10 g de HC</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                = 1,0 ración
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Siempre verás los gramos del alimento, los carbohidratos y las
              raciones calculadas.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setStep("mode")}>
              Atrás
            </Button>
            <Button onClick={completeOnboarding}>Empezar el curso</Button>
          </div>
        </section>
      )}
    </div>
  );
}
