import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { ProgressAnimatedSection } from "@/components/progress/ProgressAnimated";
import { ProgressLevelsList } from "@/components/progress/ProgressLevelsList";
import { ProgressRecentMilestones } from "@/components/progress/ProgressRecentMilestones";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getLevels,
  getExercisesForLevel,
} from "@/lib/domain/exercises";
import {
  isLevelUnlocked,
  getLevelCompletion,
  getFailedExerciseIds,
  countPassedLevels,
} from "@/lib/domain/progress";
import { accuracyRate } from "@/lib/domain/attempts";
import { aggregateAnalyticsDashboard } from "@/lib/domain/analytics-dashboard";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { resolveAttempts, resolveProgress } from "@/lib/learning-state";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserLearningEvents } from "@/lib/supabase/analytics-events";

import { NOINDEX_METADATA } from "@/lib/domain/seo";

export const metadata = NOINDEX_METADATA;

export default async function ProgressPage() {
  const [progress, attempts, user] = await Promise.all([
    resolveProgress(),
    resolveAttempts(),
    getAuthUser(),
  ]);
  const levels = getLevels();
  const passed = countPassedLevels(progress);
  const overallAccuracy = accuracyRate(attempts);

  const allFailed = getFailedExerciseIds(
    attempts,
    levels.flatMap((l) => getExercisesForLevel(l.id).map((e) => e.id)),
  );

  const levelItems = levels.map((level) => {
    const completion = getLevelCompletion(progress, level.id);
    const unlocked = isLevelUnlocked(
      level.orderIndex,
      progress.completions,
      levels,
    );
    const exerciseIds = getExercisesForLevel(level.id).map((e) => e.id);
    const failedIds = getFailedExerciseIds(attempts, exerciseIds);

    return {
      id: level.id,
      name: level.name,
      unlocked,
      masteryScore: completion?.masteryScore,
      passed: completion?.passed,
      failedCount: failedIds.length,
      hasCompletion: Boolean(completion),
    };
  });

  const timeline = user
    ? aggregateAnalyticsDashboard(
        await getUserLearningEvents(user.id),
        levels.map((level) => ({
          id: level.id,
          lessonCount: getLessonsForLevel(level.id).length,
        })),
      ).timeline
    : [];

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Mi progreso"
            description="Resumen de avance, qué repasar y tus hitos recientes."
          />

          <ProgressAnimatedSection className="mb-8">
            <ProgressStats
              passed={passed}
              totalLevels={levels.length}
              accuracy={overallAccuracy}
              reviewCount={allFailed.length}
            />
          </ProgressAnimatedSection>

          <ProgressAnimatedSection className="mb-8 space-y-4" delay={0.05}>
            <h2 className="font-display text-xl font-medium text-foreground">
              Por nivel
            </h2>
            <ProgressLevelsList levels={levelItems} />
          </ProgressAnimatedSection>

          <ProgressAnimatedSection delay={0.1}>
            <ProgressRecentMilestones
              timeline={timeline}
              signedIn={Boolean(user)}
            />
          </ProgressAnimatedSection>

          <div className="mt-8 text-center">
            <Button href="/learn">Ir al curso</Button>
          </div>
        </AppPageLayout>
      </main>
    </>
  );
}
