import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { HomeBackgroundBlobs } from "@/components/home/HomeBackgroundBlobs";
import {
  FreePracticeIcon,
  GuidedCourseIcon,
  ProgressSproutIcon,
} from "@/components/home/HomeFeatureIcons";
import { formatExchangeRule } from "@/lib/domain/regions";
import { getOnboardingState } from "@/lib/onboarding";
import { getActiveRegion, getDefaultRegion } from "@/lib/region-server";

const FEATURES = [
  {
    title: "Curso guiado",
    desc: "Lecciones cortas con ejemplos de alimentos reales de tu país, paso a paso.",
    Icon: GuidedCourseIcon,
  },
  {
    title: "Práctica libre",
    desc: "Ejercicios interactivos para afianzar el conteo de carbohidratos con comida de verdad.",
    Icon: FreePracticeIcon,
  },
  {
    title: "Progreso",
    desc: "Sigue tu avance por niveles y repasa lo que más te cuesta.",
    Icon: ProgressSproutIcon,
  },
] as const;

export default async function Home() {
  const state = await getOnboardingState();
  const region = state?.completed ? await getActiveRegion() : getDefaultRegion();

  return (
    <>
      <HomeBackgroundBlobs />
      <AppNavBar />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-20 pt-8 sm:px-8 sm:pt-12">
        <section className="hero-pill mx-auto w-full max-w-3xl px-8 py-12 text-center sm:px-14 sm:py-16">
          <h1 className="font-display text-3xl font-medium leading-snug text-foreground sm:text-4xl">
            Bienvenido a Migajas. Tu guía amable para el conteo de
            carbohidratos.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Aprende a relacionar comida real de tu país con confianza y
            tranquilidad.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Button href="/onboarding">Empezar mi curso</Button>
            <Link
              href="/learn"
              className="text-sm font-medium text-sage-strong underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ya empecé — continuar
            </Link>
          </div>
          {state?.completed ? (
            <p className="mt-6 text-sm text-sage-strong">
              {region.flag} {region.name} · {formatExchangeRule(region)}
            </p>
          ) : null}
        </section>

        <section className="mt-20 space-y-10">
          <h2 className="text-center font-display text-3xl font-medium text-foreground">
            ¿Cómo funciona?
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3 sm:gap-5">
            {FEATURES.map(({ title, desc, Icon }) => (
              <li key={title} className="feature-card px-6 py-8 text-center">
                <div className="mx-auto flex h-20 items-center justify-center text-sage-strong">
                  <Icon />
                </div>
                <h3 className="mt-4 font-display text-xl font-medium text-foreground">
                  {title}
                </h3>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
                  {desc}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
