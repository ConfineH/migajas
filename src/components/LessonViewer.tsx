"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { LessonStepFootnotes } from "@/components/content-sources/LessonStepFootnotes";
import { FoodNutritionExtras } from "@/components/FoodNutritionExtras";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Lesson } from "@/lib/domain/lessons";
import { getFoodById } from "@/lib/data/foods";
import { enrichFoodItem } from "@/lib/domain/foods";
import { formatRations } from "@/lib/domain/rations";

interface LessonViewerProps {
  lesson: Lesson;
  nextHref: string;
  exchangeUnitG: number;
}

export function LessonViewer({
  lesson,
  nextHref,
  exchangeUnitG,
}: LessonViewerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const contentSteps = lesson.steps.filter((s) => s.type !== "practice");
  const step = contentSteps[stepIndex];
  const isLast = stepIndex >= contentSteps.length - 1;
  const progressPct = Math.round(
    ((stepIndex + 1) / contentSteps.length) * 100,
  );

  async function finishLesson() {
    setCompleting(true);
    await fetch("/api/guided", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete-lesson", id: lesson.id }),
    });
    window.location.href = nextHref;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1.5 flex justify-between text-sm text-muted">
          <span>
            Paso {stepIndex + 1} de {contentSteps.length}
          </span>
          <span>Lección</span>
        </div>
        <ProgressBar percent={progressPct} />
      </div>

      <article className="feature-card p-6">
        <h2 className="font-display text-xl font-medium text-foreground">
          {step.title}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">{step.body}</p>
        {step.foodId ? (
          <FoodExample foodId={step.foodId} exchangeUnitG={exchangeUnitG} />
        ) : null}
        <LessonStepFootnotes step={step} />
      </article>

      <p className="text-center text-sm text-muted">
        ¿Necesitas consultar porciones o la tabla de conversión?{" "}
        <Link
          href="/guia"
          className="font-medium text-sage-strong underline-offset-2 hover:underline"
        >
          Abrir guía de referencia
        </Link>
      </p>

      <div className="flex justify-between gap-3">
        {stepIndex > 0 ? (
          <Button variant="ghost" onClick={() => setStepIndex((i) => i - 1)}>
            Anterior
          </Button>
        ) : (
          <span />
        )}
        {!isLast ? (
          <Button onClick={() => setStepIndex((i) => i + 1)}>Siguiente</Button>
        ) : (
          <Button onClick={finishLesson} className={completing ? "opacity-50" : ""}>
            {completing ? "Guardando…" : "Ir a la práctica"}
          </Button>
        )}
      </div>
    </div>
  );
}

function FoodExample({
  foodId,
  exchangeUnitG,
}: {
  foodId: string;
  exchangeUnitG: number;
}) {
  const food = getFoodById(foodId);
  if (!food) return null;
  const enriched = enrichFoodItem(food, exchangeUnitG);

  return (
    <div className="mt-6 rounded-xl bg-sage-light/70 p-4">
      <p className="text-sm font-medium text-sage-strong">{enriched.name}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-muted">Porción</dt>
          <dd className="font-medium text-foreground">{enriched.portionText}</dd>
        </div>
        <div>
          <dt className="text-muted">HC</dt>
          <dd className="font-medium text-foreground">{enriched.carbsG} g</dd>
        </div>
        <div>
          <dt className="text-muted">Raciones</dt>
          <dd className="font-display font-medium text-sage-strong">
            {formatRations(enriched.rations)}
          </dd>
        </div>
      </dl>
      <FoodNutritionExtras food={enriched} compact />
    </div>
  );
}
