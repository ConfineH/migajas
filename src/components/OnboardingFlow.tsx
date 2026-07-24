"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { MigajasLogo } from "@/components/brand/MigajasLogo";
import { CoursePathPreview } from "@/components/onboarding/CoursePathPreview";
import Stepper, { Step } from "@/components/react-bits/Stepper";
import {
  REGIONS,
  formatExchangeRule,
  getRegionById,
  type RegionProfile,
} from "@/lib/domain/regions";
import { ONBOARDING_COPY } from "@/lib/domain/brand-positioning";

type StepId = "welcome" | "country" | "course" | "mode" | "rations" | "clinical";

const ONBOARDING_STEPS: StepId[] = [
  "welcome",
  "country",
  "course",
  "mode",
  "rations",
];
const SETTINGS_STEPS: StepId[] = ["country", "rations", "clinical"];

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
  const steps = settingsMode ? SETTINGS_STEPS : ONBOARDING_STEPS;
  const [stepIndex, setStepIndex] = useState(1);
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
  const [clinicalRevokeBusy, setClinicalRevokeBusy] = useState(false);

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

  async function revokeClinicalConsent() {
    if (
      !window.confirm(
        "¿Retirar el consentimiento para datos de salud? Se desactivará el seguimiento personal y no podrás usar el diario hasta que vuelvas a consentir.",
      )
    ) {
      return;
    }

    setSaveError(null);
    setClinicalRevokeBusy(true);
    try {
      const response = await fetch("/api/consent/revoke-health-data", {
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setSaveError(
          payload.error ?? "No se pudo retirar el consentimiento.",
        );
        return;
      }
      setClinicalModeEnabled(false);
      setHealthDataConsent(false);
      router.refresh();
    } finally {
      setClinicalRevokeBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      {!settingsMode ? (
        <p className="sr-only">
          Paso {stepIndex} de {steps.length}
        </p>
      ) : (
        <p className="text-center text-sm text-muted">
          Cambia la región de referencia, tu meta diaria y el seguimiento personal.
        </p>
      )}

      {saveError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </p>
      ) : null}

      <Stepper
        step={stepIndex}
        onStepChange={setStepIndex}
        hideFooter
        hideIndicators={settingsMode}
        contentClassName="pt-6"
      >
        {!settingsMode ? (
          <Step>
            <section className="space-y-6 text-center">
              <MigajasLogo size="lg" className="mx-auto" />
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-medium text-foreground">
                  {ONBOARDING_COPY.welcomeTitle}
                </h1>
                <p className="text-pretty text-muted">
                  {ONBOARDING_COPY.welcomeIntro}
                </p>
              </div>
              <p className="rounded-2xl bg-sage-light/70 px-4 py-3 text-sm text-muted">
                {ONBOARDING_COPY.educationalNote}
              </p>
              <Button onClick={() => setStepIndex(2)}>Empezar</Button>
            </section>
          </Step>
        ) : null}

        <Step>
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
            <div className="flex justify-center gap-3">
              {!settingsMode ? (
                <Button variant="ghost" onClick={() => setStepIndex(1)}>
                  Atrás
                </Button>
              ) : null}
              <Button
                onClick={() => setStepIndex(settingsMode ? 2 : 3)}
              >
                Continuar
              </Button>
            </div>
          </section>
        </Step>

        {!settingsMode ? (
          <Step>
            <section className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="font-display text-3xl font-medium text-foreground">
                  Así funciona el curso
                </h1>
                <p className="text-pretty text-muted">
                  Cinco niveles guiados. Avanzas paso a paso; no hace falta
                  saberlo todo de golpe.
                </p>
              </div>
              <CoursePathPreview />
              <div className="flex justify-center gap-3">
                <Button variant="ghost" onClick={() => setStepIndex(2)}>
                  Atrás
                </Button>
                <Button onClick={() => setStepIndex(4)}>Continuar</Button>
              </div>
            </section>
          </Step>
        ) : null}

        {!settingsMode ? (
          <Step>
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
                <Button variant="ghost" onClick={() => setStepIndex(3)}>
                  Atrás
                </Button>
                <Button
                  onClick={() =>
                    guestMode
                      ? setStepIndex(5)
                      : router.push("/login?next=/onboarding")
                  }
                >
                  Continuar
                </Button>
              </div>
            </section>
          </Step>
        ) : null}

        <Step>
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
                <p className="text-xs font-medium text-muted">Ejemplo</p>
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
                  El curso usa palabras sencillas y comida dominicana de verdad,
                  con la regla de 15 gramos de carbohidratos por ración.
                </p>
              ) : null}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setStepIndex(settingsMode ? 1 : 4)}
              >
                Atrás
              </Button>
              <Button
                onClick={() =>
                  settingsMode ? setStepIndex(3) : void completeOnboarding()
                }
              >
                {settingsMode ? "Continuar" : "Empezar el curso"}
              </Button>
            </div>
          </section>
        </Step>

        {settingsMode ? (
          <Step>
            <section className="space-y-6">
              <h1 className="text-center font-display text-3xl font-medium text-foreground">
                Seguimiento personal
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
                    Opcional. Se usará en el diario y en los reportes para
                    comparar tu ingesta diaria.
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
                          Activar seguimiento personal
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
                          . Entiendo que Migajas es una herramienta educativa, no
                          un dispositivo médico.
                        </span>
                      </label>
                    ) : null}

                    {clinicalModeEnabled && canEnableClinicalMode ? (
                      <Button
                        variant="ghost"
                        onClick={revokeClinicalConsent}
                        className={
                          clinicalRevokeBusy
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      >
                        Retirar consentimiento de seguimiento personal
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Inicia sesión para activar el seguimiento personal y sincronizar tu
                    meta entre dispositivos.
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="ghost" onClick={() => setStepIndex(2)}>
                  Atrás
                </Button>
                <Button onClick={completeOnboarding}>Guardar cambios</Button>
              </div>
            </section>
          </Step>
        ) : null}
      </Stepper>
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
