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

type Step = "country" | "mode" | "rations" | "clinical";

interface OnboardingFlowProps {
  initialRegionId?: string;
  initialGuestMode?: boolean;
  initialDailyCarbGoal?: number | null;
  initialClinicalModeEnabled?: boolean;
  isAuthenticated?: boolean;
  canEnableClinicalMode?: boolean;
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
      detail: "30 g de alimento · 15 g de carbohidratos",
      carbsG: 15,
    },
  };

export function OnboardingFlow({
  initialRegionId = "es",
  initialGuestMode = true,
  initialDailyCarbGoal = null,
  initialClinicalModeEnabled = false,
  isAuthenticated = false,
  canEnableClinicalMode = false,
  settingsMode = false,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("country");
  const [regionId, setRegionId] = useState(initialRegionId);
  const [guestMode, setGuestMode] = useState(initialGuestMode);
  const [dailyCarbGoal, setDailyCarbGoal] = useState(
    initialDailyCarbGoal?.toString() ?? "",
  );
  const [clinicalModeEnabled, setClinicalModeEnabled] = useState(
    initialClinicalModeEnabled,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const region = getRegionById(regionId);
  const example = REGION_EXAMPLES[region.id] ?? REGION_EXAMPLES.es;

  function parseGoalInput(): number | null {
    const trimmed = dailyCarbGoal.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }
    return value;
  }

  async function completeOnboarding() {
    setSaveError(null);
    const goal = parseGoalInput();
    if (dailyCarbGoal.trim() && goal === null) {
      setSaveError("La meta diaria debe ser un número entero mayor que 0.");
      return;
    }

    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionId: region.id,
        guestMode,
        completed: true,
        daily_carb_goal_g: goal,
      }),
    });

    if (isAuthenticated) {
      const profileResponse = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region_id: region.id,
          daily_carb_goal_g: goal,
          clinical_mode_enabled: clinicalModeEnabled,
        }),
      });

      if (!profileResponse.ok) {
        const payload = (await profileResponse.json()) as { error?: string };
        setSaveError(payload.error ?? "No se pudo guardar el perfil.");
        return;
      }
    }

    router.push(settingsMode ? "/learn" : "/learn");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {settingsMode ? (
        <p className="text-center text-sm text-gray-600">
          Cambia la región de referencia, tu meta diaria y el modo clínico.
        </p>
      ) : null}

      {saveError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
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
              <p className="text-sm text-emerald-800">
                El curso usa palabras sencillas y comida dominicana de verdad, con
                la regla de 15 gramos de carbohidratos por ración.
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
            <Button
              onClick={() =>
                settingsMode ? setStep("clinical") : completeOnboarding()
              }
            >
              {settingsMode ? "Continuar" : "Empezar el curso"}
            </Button>
          </div>
        </section>
      )}

      {step === "clinical" && settingsMode && (
        <section className="space-y-6">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Modo clínico
          </h1>
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-800">
                Meta diaria de carbohidratos (g)
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={dailyCarbGoal}
                onChange={(event) => setDailyCarbGoal(event.target.value)}
                placeholder="Ej. 160"
                className="w-full rounded-xl border border-gray-200 px-4 py-3"
              />
              <span className="text-xs text-gray-600">
                Opcional. Se usará en el diario y en los reportes para comparar
                tu ingesta diaria.
              </span>
            </label>

            {isAuthenticated ? (
              <label className="flex items-start gap-3 rounded-xl bg-white p-4">
                <input
                  type="checkbox"
                  checked={clinicalModeEnabled}
                  disabled={!canEnableClinicalMode}
                  onChange={(event) =>
                    setClinicalModeEnabled(event.target.checked)
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">
                    Activar modo clínico
                  </span>
                  <br />
                  {canEnableClinicalMode
                    ? "Podrás registrar tu ingesta desde el nivel 3 en adelante."
                    : "Disponible tras aprobar el examen del nivel 3."}
                </span>
              </label>
            ) : (
              <p className="text-sm text-gray-600">
                Inicia sesión para activar el modo clínico y sincronizar tu meta
                entre dispositivos.
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="ghost" onClick={() => setStep("rations")}>
              Atrás
            </Button>
            <Button onClick={completeOnboarding}>Guardar cambios</Button>
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
