"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import {
  REGIONS,
  formatExchangeRule,
  getRegionById,
  type RegionProfile,
} from "@/lib/domain/regions";

type Step = "country" | "mode" | "rations";

interface OnboardingFlowProps {
  initialRegionId?: string;
  initialGuestMode?: boolean;
  settingsMode?: boolean;
}

const REGION_EXAMPLES: Record<string, { food: string; detail: string; carbsG: number }> =
  {
    es: {
      food: "1 rebanada de pan blanco",
      detail: "25 g de alimento · 10 g de HC",
      carbsG: 10,
    },
    do: {
      food: "1 pieza de casabe",
      detail: "30 g de alimento · 15 g de HC",
      carbsG: 15,
    },
  };

export function OnboardingFlow({
  initialRegionId = "es",
  initialGuestMode = true,
  settingsMode = false,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("country");
  const [regionId, setRegionId] = useState(initialRegionId);
  const [guestMode, setGuestMode] = useState(initialGuestMode);

  const region = getRegionById(regionId);
  const example = REGION_EXAMPLES[region.id] ?? REGION_EXAMPLES.es;

  async function completeOnboarding() {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionId: region.id,
        guestMode,
        completed: true,
      }),
    });
    router.push(settingsMode ? "/learn" : "/learn");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {settingsMode ? (
        <p className="text-center text-sm text-gray-600">
          Cambia la región de referencia para catálogo, guía y cálculo de raciones.
        </p>
      ) : null}

      {step === "country" && (
        <section className="space-y-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {settingsMode ? "Tu región" : "¿Dónde vas a practicar?"}
          </h1>
          <p className="text-gray-600">
            Cada región usa su propia regla de raciones y alimentos habituales.
          </p>
          <div className="space-y-3">
            {REGIONS.map((item) => (
              <RegionOption
                key={item.id}
                region={item}
                selected={regionId === item.id}
                onSelect={() => setRegionId(item.id)}
              />
            ))}
          </div>
          <Button
            onClick={() =>
              settingsMode ? setStep("rations") : setStep("mode")
            }
          >
            Continuar
          </Button>
        </section>
      )}

      {step === "mode" && !settingsMode && (
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
                Guarda tu progreso entre dispositivos.
              </p>
            </button>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => setStep("country")}>
              Atrás
            </Button>
            <Button
              onClick={() =>
                guestMode
                  ? setStep("rations")
                  : router.push("/login?next=/onboarding")
              }
            >
              Continuar
            </Button>
          </div>
        </section>
      )}

      {step === "rations" && (
        <section className="space-y-6">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            ¿Qué es una ración?
          </h1>
          <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-gray-800">
              En <strong>{region.name}</strong>, una <strong>ración</strong>{" "}
              equivale a{" "}
              <strong>{region.exchangeUnitG} gramos de carbohidratos</strong>.
            </p>
            <div className="rounded-xl bg-white p-4 text-center">
              <p className="text-sm text-gray-500">Ejemplo</p>
              <p className="mt-1 text-lg font-semibold">{example.food}</p>
              <p className="text-gray-600">{example.detail}</p>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                = 1,0 ración
              </p>
            </div>
            <p className="text-sm text-gray-600">
              {formatExchangeRule(region)}. Siempre verás los gramos del
              alimento, los carbohidratos y las raciones calculadas.
            </p>
            {region.id === "do" ? (
              <p className="text-sm text-amber-800">
                El curso guiado sigue usando ejemplos de España por ahora; el
                catálogo y la guía ya están adaptados a República Dominicana.
              </p>
            ) : null}
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(settingsMode ? "country" : "mode")}
            >
              Atrás
            </Button>
            <Button onClick={completeOnboarding}>
              {settingsMode ? "Guardar cambios" : "Empezar el curso"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function RegionOption({
  region,
  selected,
  onSelect,
}: {
  region: RegionProfile;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border-2 p-5 text-left transition-colors ${
        selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 hover:border-emerald-200"
      }`}
    >
      <p className="text-2xl">{region.flag}</p>
      <p className="mt-2 text-lg font-semibold text-emerald-800">{region.name}</p>
      <p className="mt-1 text-sm text-emerald-600">{formatExchangeRule(region)}</p>
    </button>
  );
}
