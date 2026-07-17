import { notFound } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { FlashcardDeck } from "@/components/FlashcardDeck";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnSectionHeader } from "@/components/layout/LearnSectionHeader";
import { getRegionalContentContext } from "@/lib/content-for-region";
import { getFoodById } from "@/lib/data/foods";
import { enrichFoodItem } from "@/lib/domain/foods";
import { getLevelById, getLevels } from "@/lib/domain/exercises";
import {
  buildLevelFlashcardDeck,
  getEssentialFlashcardFoodIds,
} from "@/lib/domain/level-flashcards";
import { resolveRegionalFoodId } from "@/lib/domain/content-localization";
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
        <main className="flex flex-1 flex-col">
          <AppPageLayout className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              📚
            </p>
            <h1 className="mt-4 font-display text-xl font-medium text-foreground">
              Completa el curso primero
            </h1>
            <p className="mt-2 text-muted">
              Termina las lecciones y prácticas antes de repasar las fichas.
            </p>
            <div className="mt-6">
              <Button href={`/learn/${levelId}`}>Volver al nivel</Button>
            </div>
          </AppPageLayout>
        </main>
      </>
    );
  }

  const { region, foods } = await getRegionalContentContext();
  const canonicalFoodIds = getEssentialFlashcardFoodIds(levelId);
  const foodIds = canonicalFoodIds.map((id) =>
    resolveRegionalFoodId(id, region.id),
  );
  const cards = buildLevelFlashcardDeck(levelId).map((card) => ({
    ...card,
    foodId: resolveRegionalFoodId(card.foodId, region.id),
  }));

  const foodsById = Object.fromEntries(
    foodIds
      .map((id) => {
        const item = foods.find((f) => f.id === id) ?? getFoodById(id);
        if (!item) return null;
        return [id, enrichFoodItem(item, region.exchangeUnitG, region.id)] as const;
      })
      .filter((entry): entry is [string, ReturnType<typeof enrichFoodItem>] =>
        Boolean(entry),
      ),
  );

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <LearnSectionHeader
            backHref={`/learn/${levelId}`}
            backLabel="Volver al nivel"
            eyebrow="Fichas del nivel"
            title={level.name}
            description={`Repasa ${foodIds.length} alimentos esenciales (${cards.length} fichas) antes del examen. Cada uno cubre porción, carbohidratos y raciones.`}
          />
          <FlashcardDeck
            levelId={levelId}
            cards={cards}
            foodsById={foodsById}
            exchangeUnitG={region.exchangeUnitG}
            regionId={region.id}
            returnHref={`/learn/${levelId}`}
          />
        </AppPageLayout>
      </main>
    </>
  );
}
