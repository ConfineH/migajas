"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { LessonStepFootnotes } from "@/components/content-sources/LessonStepFootnotes";
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
      <div className="mb-2 flex justify-between text-sm text-gray-500">
        <span>
          Paso {stepIndex + 1} de {contentSteps.length}
        </span>
        <span>Lección</span>
      </div>

      <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
        <p className="mt-4 text-gray-700 leading-relaxed">{step.body}</p>
        {step.foodId && (
          <FoodExample foodId={step.foodId} exchangeUnitG={exchangeUnitG} />
        )}
        <LessonStepFootnotes step={step} />
      </article>

      <p className="text-center text-sm text-gray-500">
        ¿Necesitas consultar porciones o la tabla de conversión?{" "}
        <Link href="/guia" className="font-semibold text-emerald-700">
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
    <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
      <p className="text-sm font-medium text-emerald-700">{enriched.name}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-gray-500">Porción</dt>
          <dd className="font-medium">{enriched.portionText}</dd>
        </div>
        <div>
          <dt className="text-gray-500">HC</dt>
          <dd className="font-medium">{enriched.carbsG} g</dd>
        </div>
        <div>
          <dt className="text-gray-500">Raciones</dt>
          <dd className="font-bold text-emerald-700">
            {formatRations(enriched.rations)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
