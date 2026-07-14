import { notFound } from "next/navigation";
import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Button } from "@/components/Button";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { getFoodById } from "@/lib/data/foods";
import { enrichFoodItem } from "@/lib/domain/foods";
import { getLevelById, getLevels } from "@/lib/domain/exercises";
import {
  buildLevelFlashcardDeck,
  getEssentialFlashcardFoodIds,
} from "@/lib/domain/level-flashcards";
import { resolveProgress } from "@/lib/learning-state";
import {
  toGuidedProgress,
  canAccessFlashcards,
  isGuidedLevelUnlocked,
} from "@/lib/domain/guided-flow";

interface Props {
  params: Promise<{ levelId: string }>;
}

export default async function LevelFlashcardsPage({ params }: Props) {
  const { levelId } = await params;
  const level = getLevelById(levelId);
  if (!level) notFound();

  const stored = await resolveProgress();
  const progress = toGuidedProgress(stored);
  const levels = getLevels();

  if (!isGuidedLevelUnlocked(levelId, progress, levels)) {
    notFound();
  }

  if (!canAccessFlashcards(progress, levelId)) {
    return (
      <>
        <AppNavBar />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-12 text-center">
          <p className="text-4xl">📚</p>
          <h1 className="mt-4 text-xl font-bold">Completa el curso primero</h1>
          <p className="mt-2 text-gray-600">
            Termina las lecciones y prácticas antes de repasar las fichas.
          </p>
          <div className="mt-6">
            <Button href={`/learn/${levelId}`}>Volver al nivel</Button>
          </div>
        </main>
      </>
    );
  }

  const { region, foods } = await getRegionalContentContext();
  const cards = buildLevelFlashcardDeck(levelId);
  const foodIds = getEssentialFlashcardFoodIds(levelId);

  const foodsById = Object.fromEntries(
    foodIds
      .map((id) => {
        const item = foods.find((f) => f.id === id) ?? getFoodById(id);
        if (!item) return null;
        return [id, enrichFoodItem(item, region.exchangeUnitG)] as const;
      })
      .filter((entry): entry is [string, ReturnType<typeof enrichFoodItem>] =>
        Boolean(entry),
      ),
  );

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <Link
            href={`/learn/${levelId}`}
            className="text-sm text-emerald-600 hover:underline"
          >
            ← Volver al nivel
          </Link>
          <p className="mt-2 text-sm font-medium text-violet-600">
            Fichas del nivel
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{level.name}</h1>
          <p className="mt-2 text-gray-600">
            Repasa {foodIds.length} alimentos esenciales ({cards.length} fichas)
            antes del examen. Cada uno cubre porción, carbohidratos y raciones.
          </p>
        </header>
        <FlashcardDeck
          levelId={levelId}
          cards={cards}
          foodsById={foodsById}
          exchangeUnitG={region.exchangeUnitG}
          returnHref={`/learn/${levelId}`}
        />
      </main>
    </>
  );
}
