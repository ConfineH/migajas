"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import {
  FIRST_RATION_COPY,
  gradeFirstRationAnswer,
  type FirstRationSession,
} from "@/lib/domain/first-ration";
import type { EnrichedFoodItem } from "@/lib/domain/foods";

interface FirstRationClientProps {
  session: FirstRationSession;
  continueHref: string;
}

function FoodTile({ food }: { food: EnrichedFoodItem }) {
  return (
    <article className="rounded-2xl bg-sage-light/50 px-4 py-3">
      <h3 className="font-medium text-foreground">{food.name}</h3>
      <p className="mt-1 text-sm text-muted">
        {food.portionText} · {food.grams} g de alimento · {food.carbsG} g de
        carbohidratos
      </p>
    </article>
  );
}

export function FirstRationClient({
  session,
  continueHref,
}: FirstRationClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const isCorrect = selected
    ? gradeFirstRationAnswer(selected, session.correctAnswer)
    : false;

  async function markDoneAndGo() {
    setBusy(true);
    await fetch("/api/first-ration", { method: "POST" });
    router.push(continueHref);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-medium text-foreground">
          {FIRST_RATION_COPY.galleryHeading}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {session.staples.map((food) => (
            <li key={food.id}>
              <FoodTile food={food} />
            </li>
          ))}
        </ul>
      </section>

      <section className="feature-card space-y-5 p-6 sm:p-8">
        <div>
          <p className="text-sm font-medium text-sage-strong">
            {session.estimate.name}
          </p>
          <h2 className="mt-1 font-display text-xl font-medium text-foreground">
            {session.prompt}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {session.estimate.portionText} · {session.estimate.carbsG} g de
            carbohidratos
          </p>
        </div>

        {!checked ? (
          <ul className="space-y-3" role="listbox" aria-label="Opciones">
            {session.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected === option.value}
                  onClick={() => setSelected(option.value)}
                  className={`choice-button ${
                    selected === option.value ? "choice-button-selected" : ""
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={isCorrect ? "feedback-correct" : "feedback-wrong"}
            role="status"
          >
            <p
              className={`text-lg font-medium ${
                isCorrect ? "text-sage-strong" : "text-red-700"
              }`}
            >
              {isCorrect ? "Correcto" : "Incorrecto"}
            </p>
            <p className="mt-2 text-muted">
              {isCorrect
                ? FIRST_RATION_COPY.correct
                : FIRST_RATION_COPY.incorrect}{" "}
              {session.explanation}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!checked ? (
            <Button
              onClick={() => setChecked(true)}
              disabled={!selected}
              className={!selected ? "pointer-events-none opacity-50" : ""}
            >
              {FIRST_RATION_COPY.check}
            </Button>
          ) : (
            <Button onClick={() => void markDoneAndGo()} disabled={busy}>
              {busy ? "Continuando…" : FIRST_RATION_COPY.continue}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => void markDoneAndGo()}
            disabled={busy}
          >
            {FIRST_RATION_COPY.skip}
          </Button>
        </div>
      </section>
    </div>
  );
}
