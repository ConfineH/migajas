"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import AnimatedContent from "@/components/react-bits/AnimatedContent";
import StaggeredList from "@/components/react-bits/StaggeredList";

const FEATURES = [
  {
    title: "Curso guiado",
    desc: "Lecciones cortas con ejemplos de alimentos reales de tu país, paso a paso.",
    icon: "📖",
  },
  {
    title: "Práctica libre",
    desc: "Ejercicios interactivos para afianzar el conteo de carbohidratos con comida de verdad.",
    icon: "✏️",
  },
  {
    title: "Progreso",
    desc: "Sigue tu avance por niveles y repasa lo que más te cuesta.",
    icon: "🌱",
  },
] as const;

export function HomeHero({
  regionLine,
}: {
  regionLine?: string | null;
}) {
  return (
    <AnimatedContent
      animateOnMount
      distance={28}
      duration={0.7}
      className="hero-pill mx-auto w-full max-w-3xl px-8 py-12 text-center sm:px-14 sm:py-16"
    >
      <h1 className="font-display text-3xl font-medium leading-snug text-foreground sm:text-4xl">
        Bienvenido a Migajas. Tu guía amable para el conteo de carbohidratos.
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted sm:text-lg">
        Aprende a relacionar comida real de tu país con confianza y tranquilidad.
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
      {regionLine ? (
        <p className="mt-6 text-sm text-sage-strong">{regionLine}</p>
      ) : null}
    </AnimatedContent>
  );
}

export function HomeFeatures() {
  return (
    <section className="mt-20 space-y-10">
      <AnimatedContent distance={24} className="text-center">
        <h2 className="font-display text-3xl font-medium text-foreground">
          ¿Cómo funciona?
        </h2>
      </AnimatedContent>
      <StaggeredList
        className="grid gap-6 sm:grid-cols-3 sm:gap-5"
        itemClassName="h-full"
      >
        {FEATURES.map(({ title, desc, icon }) => (
          <div key={title} className="feature-card px-6 py-8 text-center h-full">
            <div className="mx-auto flex h-20 items-center justify-center text-4xl">
              {icon}
            </div>
            <h3 className="mt-4 font-display text-xl font-medium text-foreground">
              {title}
            </h3>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-muted">
              {desc}
            </p>
          </div>
        ))}
      </StaggeredList>
    </section>
  );
}
