"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { HERO_COPY } from "@/lib/domain/brand-positioning";
import AnimatedContent from "@/components/react-bits/AnimatedContent";
import StaggeredList from "@/components/react-bits/StaggeredList";
import type { HomeHeroCtas } from "@/lib/domain/hub-dashboard";
import {
  FreePracticeIcon,
  GuidedCourseIcon,
  ProgressSproutIcon,
} from "@/components/home/HomeFeatureIcons";
import type { ComponentType } from "react";

const FEATURES: {
  title: string;
  desc: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    title: "Curso guiado",
    desc: "Lecciones cortas con ejemplos de alimentos reales de tu país, paso a paso.",
    Icon: GuidedCourseIcon,
  },
  {
    title: "Comida de tu país",
    desc: "Ejemplos cotidianos (tostada, arroz, mangú…) para aprender a observar carbohidratos.",
    Icon: FreePracticeIcon,
  },
  {
    title: "Progreso",
    desc: "Sigue tu avance por niveles y repasa lo que más te cuesta.",
    Icon: ProgressSproutIcon,
  },
];

export function HomeHero({
  regionLine,
  ctas,
}: {
  regionLine?: string | null;
  ctas?: HomeHeroCtas | null;
}) {
  const primaryHref = ctas?.primaryHref ?? "/onboarding";
  const primaryLabel = ctas?.primaryLabel ?? HERO_COPY.ctaPrimary;
  const secondaryHref = ctas?.secondaryHref ?? "/learn";
  const secondaryLabel = ctas?.secondaryLabel ?? HERO_COPY.ctaSecondary;

  return (
    <AnimatedContent
      animateOnMount
      distance={28}
      duration={0.7}
      className="hero-pill mx-auto w-full max-w-3xl px-8 py-12 text-center sm:px-14 sm:py-16"
    >
      <h1 className="font-display text-3xl font-medium leading-snug text-foreground text-balance sm:text-4xl">
        {HERO_COPY.headline}
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-foreground/75 sm:text-lg">
        {HERO_COPY.subtitle}
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button href={primaryHref}>{primaryLabel}</Button>
        <Link
          href={secondaryHref}
          className="text-sm font-medium text-sage-strong underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {secondaryLabel}
        </Link>
      </div>
      {regionLine ? (
        <p className="mt-6 text-sm font-medium text-foreground/80">
          {regionLine}
        </p>
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
        {FEATURES.map(({ title, desc, Icon }) => (
          <div key={title} className="feature-card px-6 py-8 text-center h-full">
            <div className="mx-auto flex h-20 items-center justify-center text-sage-strong">
              <Icon className="h-14 w-14" />
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
