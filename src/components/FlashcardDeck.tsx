"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
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
  returnHref: string;
}

export function FlashcardDeck({
  levelId,
  cards,
  foodsById,
  exchangeUnitG,
  returnHref,
}: FlashcardDeckProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const card = cards[index];
  const food = card ? foodsById[card.foodId] : undefined;
  const face =
    card && food ? getFlashcardFace(card, food, exchangeUnitG) : null;
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
      <p className="text-center text-gray-600">
        No hay fichas disponibles para este nivel.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-sm font-medium text-violet-800">
        Memoriza porciones, carbohidratos y raciones de cada alimento del nivel
      </div>

      <div>
        <div className="mb-2 flex justify-between text-sm text-gray-500">
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
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        className={`w-full rounded-2xl border-2 p-8 text-left shadow-sm transition-colors ${
          revealed
            ? "border-violet-300 bg-violet-50"
            : "border-gray-200 bg-white hover:border-violet-200"
        }`}
      >
        <p className="text-sm font-medium uppercase tracking-wide text-violet-600">
          {revealed ? "Respuesta" : "Pregunta"}
        </p>
        <p className="mt-4 text-xl font-semibold text-gray-900">
          {revealed ? face.back : face.front}
        </p>
        {!revealed && face.hint && (
          <p className="mt-4 text-sm text-gray-500">{face.hint}</p>
        )}
        {!revealed && (
          <p className="mt-6 text-sm font-medium text-violet-600">
            Toca para ver la respuesta
          </p>
        )}
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
