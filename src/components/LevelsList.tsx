import {
  getLevels,
  getExercisesForLevel,
} from "@/lib/domain/exercises";
import {
  isLevelUnlocked,
  getLevelCompletion,
  getFailedExerciseIds,
} from "@/lib/domain/progress";
import type { UserProgress } from "@/lib/domain/progress";
import type { Attempt } from "@/lib/domain/attempts";
import { LevelCard } from "@/components/LevelCard";

interface LevelsListProps {
  progress: UserProgress;
  attempts: Attempt[];
}

export function LevelsList({ progress, attempts }: LevelsListProps) {
  const levels = getLevels();

  return (
    <div className="space-y-4">
      {levels.map((level) => {
        const exercises = getExercisesForLevel(level.id);
        const exerciseIds = exercises.map((e) => e.id);
        const unlocked = isLevelUnlocked(
          level.orderIndex,
          progress.completions,
          levels,
        );
        const completion = getLevelCompletion(progress, level.id);
        const failedCount = unlocked
          ? getFailedExerciseIds(attempts, exerciseIds).length
          : 0;

        return (
          <LevelCard
            key={level.id}
            id={level.id}
            name={level.name}
            description={level.description}
            exerciseCount={exercises.length}
            unlocked={unlocked}
            completion={completion}
            failedCount={failedCount}
          />
        );
      })}
    </div>
  );
}
