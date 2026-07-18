"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [healthDataConsent, setHealthDataConsent] = useState(
    initialClinicalModeEnabled,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountActionError, setAccountActionError] = useState<string | null>(
    null,
  );
  const [accountBusy, setAccountBusy] = useState(false);

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
      if (clinicalModeEnabled && !healthDataConsent) {
        setSaveError(
          "Debes dar tu consentimiento explícito para tratar datos de salud.",
        );
        return;
      }

      const profileResponse = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region_id: region.id,
          daily_carb_goal_g: goal,
          clinical_mode_enabled: clinicalModeEnabled,
          ...(clinicalModeEnabled
            ? { health_data_consent: true }
            : {}),
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

  async function exportAccountData() {
    setAccountActionError(null);
    setAccountBusy(true);
    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setAccountActionError(payload.error ?? "No se pudo exportar.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "migajas-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setAccountBusy(false);
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "¿Seguro que quieres eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setAccountActionError(null);
    setAccountBusy(true);
    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setAccountActionError(payload.error ?? "No se pudo eliminar la cuenta.");
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setAccountBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {!settingsMode ? (
        <OnboardingStepIndicator
          step={step}
          steps={["country", "mode", "rations"]}
        />
      ) : null}

      {settingsMode ? (
        <p className="text-center text-sm text-muted">
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
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-medium text-foreground">
              {settingsMode ? "Tu región" : "¿Dónde vas a practicar?"}
            </h1>
            <p className="text-pretty text-muted">
              Cada región usa su propia regla de raciones y alimentos habituales.
            </p>
          </div>
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
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-medium text-foreground">
              ¿Cómo quieres empezar?
            </h1>
            <p className="text-pretty text-muted">
              Puedes probar sin cuenta o registrarte para guardar el progreso.
            </p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setGuestMode(true)}
              className={`surface-card-interactive w-full p-5 text-left ${
                guestMode ? "surface-card-selected" : ""
              }`}
            >
              <p className="font-semibold text-foreground">Modo invitado</p>
              <p className="mt-1 text-sm text-muted">
                Empieza al momento, sin registrarte.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setGuestMode(false)}
              className={`surface-card-interactive w-full p-5 text-left ${
                !guestMode ? "surface-card-selected" : ""
              }`}
            >
              <p className="font-semibold text-foreground">Crear cuenta</p>
              <p className="mt-1 text-sm text-muted">
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
          <h1 className="text-center font-display text-3xl font-medium text-foreground">
            ¿Qué es una ración?
          </h1>
          <div className="space-y-4 rounded-3xl bg-sage-light p-6 shadow-soft">
            <p className="text-pretty text-foreground">
              En <strong>{region.name}</strong>, una <strong>ración</strong>{" "}
              equivale a{" "}
              <strong>{region.exchangeUnitG} gramos de carbohidratos</strong>.
            </p>
            <div className="rounded-2xl bg-surface p-5 text-center shadow-soft">
              <p className="text-xs font-medium text-muted">
                Ejemplo
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {example.food}
              </p>
              <p className="text-muted">{example.detail}</p>
              <p className="mt-3 font-display text-3xl font-medium tabular-nums text-sage-strong">
                = 1,0 ración
              </p>
            </div>
            <p className="text-pretty text-sm leading-relaxed text-muted">
              {formatExchangeRule(region)}. Siempre verás los gramos del
              alimento, los carbohidratos y las raciones calculadas.
            </p>
            {region.id === "do" ? (
              <p className="text-pretty text-sm text-sage-strong">
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
          <h1 className="text-center font-display text-3xl font-medium text-foreground">
            Modo clínico
          </h1>
          <div className="space-y-4 rounded-3xl bg-sage-light/70 p-6 shadow-soft">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                Meta diaria de carbohidratos (g)
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={dailyCarbGoal}
                onChange={(event) => setDailyCarbGoal(event.target.value)}
                placeholder="Ej. 160"
                className="field-input"
              />
              <span className="text-xs text-muted">
                Opcional. Se usará en el diario y en los reportes para comparar
                tu ingesta diaria.
              </span>
            </label>

            {isAuthenticated ? (
              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-soft">
                  <input
                    type="checkbox"
                    checked={clinicalModeEnabled}
                    disabled={!canEnableClinicalMode}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setClinicalModeEnabled(enabled);
                      if (!enabled) {
                        setHealthDataConsent(false);
                      }
                    }}
                    className="mt-1"
                  />
                  <span className="text-sm text-muted">
                    <span className="font-medium text-foreground">
                      Activar modo clínico
                    </span>
                    <br />
                    {canEnableClinicalMode
                      ? "Podrás registrar tu ingesta desde el nivel 3 en adelante."
                      : "Disponible tras aprobar el examen del nivel 3."}
                  </span>
                </label>

                {clinicalModeEnabled && canEnableClinicalMode ? (
                  <label className="flex items-start gap-3 rounded-2xl border border-sage/30 bg-sage-light/50 p-4">
                    <input
                      type="checkbox"
                      checked={healthDataConsent}
                      onChange={(event) =>
                        setHealthDataConsent(event.target.checked)
                      }
                      className="mt-1"
                    />
                    <span className="text-sm text-muted">
                      Consiento el tratamiento de mis datos de alimentación
                      según la{" "}
                      <Link
                        href="/privacidad"
                        className="font-medium text-sage-strong underline"
                      >
                        política de privacidad
                      </Link>
                      . Entiendo que Migajas es una herramienta educativa, no un
                      dispositivo médico.
                    </span>
                  </label>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Inicia sesión para activar el modo clínico y sincronizar tu meta
                entre dispositivos.
              </p>
            )}
          </div>

          {isAuthenticated ? (
            <div className="feature-card space-y-4 p-6">
              <h2 className="font-display text-lg font-medium text-foreground">
                Privacidad y datos
              </h2>
              <p className="text-sm text-muted">
                Puedes exportar o eliminar todos tus datos personales.
              </p>
              {accountActionError ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {accountActionError}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  onClick={exportAccountData}
                  className={accountBusy ? "opacity-50 pointer-events-none" : ""}
                >
                  Exportar mis datos
                </Button>
                <Button
                  variant="ghost"
                  onClick={deleteAccount}
                  className={accountBusy ? "opacity-50 pointer-events-none" : ""}
                >
                  Eliminar cuenta
                </Button>
              </div>
            </div>
          ) : null}

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
      className={`surface-card-interactive w-full p-5 text-left ${
        selected ? "surface-card-selected" : ""
      }`}
    >
      <p className="text-3xl">{region.flag}</p>
      <p className="mt-2 text-lg font-semibold text-sage-strong">{region.name}</p>
      <p className="mt-1 text-sm text-muted">{formatExchangeRule(region)}</p>
    </button>
  );
}

const STEP_LABELS: Record<Step, string> = {
  country: "Región",
  mode: "Cuenta",
  rations: "Raciones",
  clinical: "Clínico",
};

function OnboardingStepIndicator({
  step,
  steps,
}: {
  step: Step;
  steps: Step[];
}) {
  const currentIndex = steps.indexOf(step);

  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label={`Paso ${currentIndex + 1} de ${steps.length}: ${STEP_LABELS[step]}`}
    >
      {steps.map((item, index) => {
        const done = index < currentIndex;
        const active = item === step;

        return (
          <div key={item} className="flex items-center gap-2">
            <span
              className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors duration-200 ${
                active
                  ? "bg-sage-strong text-white shadow-soft"
                  : done
                    ? "bg-sage-light text-sage-strong"
                    : "bg-sage-muted/40 text-muted"
              }`}
            >
              {index + 1}
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={`h-px w-6 sm:w-10 ${
                  done ? "bg-sage-strong/30" : "bg-border"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
