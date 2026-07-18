"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getFlashcardFace,
  type LevelFlashcard,
} from "@/lib/domain/level-flashcards";
import type { EnrichedFoodItem } from "@/lib/domain/foods";

interface FlashcardDeckProps {
  levelId: string;
  cards: LevelFlashcard[];
  foodsById: Record<string, EnrichedFoodItem>;
  exchangeUnitG: number;
  regionId?: string;
  returnHref: string;
}

export function FlashcardDeck({
  levelId,
  cards,
  foodsById,
  exchangeUnitG,
  regionId = "es",
  returnHref,
}: FlashcardDeckProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const card = cards[index];
  const food = card ? foodsById[card.foodId] : undefined;
  const face =
    card && food
      ? getFlashcardFace(card, food, exchangeUnitG, regionId)
      : null;
  const isLast = index >= cards.length - 1;
  const progressPct = cards.length
    ? ((index + (revealed ? 1 : 0)) / cards.length) * 100
    : 0;

  async function finishSession() {
    setFinishing(true);
    await fetch("/api/guided", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete-flashcards",
        id: levelId,
      }),
    });
    router.push(returnHref);
  }

  function nextCard() {
    if (isLast) {
      void finishSession();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  if (!card || !food || !face) {
    return (
      <p className="text-center text-muted">
        No hay fichas disponibles para este nivel.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="callout-sage text-sm font-medium text-foreground">
        Memoriza porciones, carbohidratos y raciones de cada alimento del nivel
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-sm text-muted">
          <span>
            Ficha {index + 1} de {cards.length}
          </span>
          <span className="capitalize">
            {card.mode === "portion"
              ? "Porción"
              : card.mode === "carbs"
                ? "Carbohidratos"
                : "Raciones"}
          </span>
        </div>
        <ProgressBar percent={progressPct} />
      </div>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={`w-full rounded-2xl border-2 p-8 text-left shadow-soft transition-all duration-200 ${
          revealed
            ? "border-sage-strong/40 bg-sage-light/80"
            : "border-border bg-surface hover:border-sage-strong/25"
        }`}
      >
        <p className="text-sm font-medium uppercase tracking-wide text-sage-strong">
          {revealed ? "Respuesta" : "Pregunta"}
        </p>
        <p className="mt-4 font-display text-xl font-medium text-foreground">
          {revealed ? face.back : face.front}
        </p>
        {!revealed && face.hint ? (
          <p className="mt-4 text-sm text-muted">{face.hint}</p>
        ) : null}
        {!revealed ? (
          <p className="mt-6 text-sm font-medium text-sage-strong">
            Toca para ver la respuesta
          </p>
        ) : null}
      </button>

      <div className="flex justify-center gap-3">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Mostrar respuesta</Button>
        ) : (
          <Button onClick={nextCard} className={finishing ? "opacity-50" : ""}>
            {isLast ? (finishing ? "Guardando…" : "Terminar repaso") : "Siguiente ficha"}
          </Button>
        )}
      </div>
    </div>
  );
}
