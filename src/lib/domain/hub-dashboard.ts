import type { Level } from "@/lib/domain/exercises";
import {
  getLessonProgressPercent,
  getNextGuidedItem,
  isGuidedLevelUnlocked,
  type GuidedItem,
  type GuidedProgress,
} from "@/lib/domain/guided-flow";

export function getGuidedItemHref(levelId: string, item: GuidedItem): string {
  if (item.type === "lesson") {
    return `/learn/${levelId}/lessons/${item.id}`;
  }
  if (item.type === "practice") {
    return `/learn/${levelId}/practice/${item.id}`;
  }
  if (item.type === "flashcards") {
    return `/learn/${levelId}/fichas`;
  }
  return `/learn/${levelId}/exam`;
}

export type HubCourseFocus = {
  levelId: string;
  levelName: string;
  progressPercent: number;
  nextItem: GuidedItem | null;
  continueHref: string;
  nextLabel: string;
};

function describeNextItem(item: GuidedItem): string {
  if (item.type === "lesson") return item.title;
  if (item.type === "practice") return item.title;
  if (item.type === "flashcards") return "Fichas del nivel";
  return item.title;
}

export function resolveHubCourseFocus(
  progress: GuidedProgress,
  levels: Level[],
): HubCourseFocus | null {
  const unlocked = levels.filter((level) =>
    isGuidedLevelUnlocked(level.id, progress, levels),
  );

  if (unlocked.length === 0) {
    return null;
  }

  for (const level of unlocked) {
    const nextItem = getNextGuidedItem(progress, level.id);
    if (nextItem) {
      return {
        levelId: level.id,
        levelName: level.name,
        progressPercent: getLessonProgressPercent(progress, level.id),
        nextItem,
        continueHref: getGuidedItemHref(level.id, nextItem),
        nextLabel: describeNextItem(nextItem),
      };
    }
  }

  const lastLevel = unlocked[unlocked.length - 1]!;
  return {
    levelId: lastLevel.id,
    levelName: lastLevel.name,
    progressPercent: 100,
    nextItem: null,
    continueHref: `/learn/${lastLevel.id}`,
    nextLabel: "Repasar el curso",
  };
}

export function getHubProgressSummary(
  progress: GuidedProgress,
  levels: Level[],
  activeLevelId?: string,
) {
  const passed = progress.levelCompletions.filter((c) => c.passed).length;
  const activeLevel =
    levels.find((level) => level.id === activeLevelId) ?? levels[0];
  const activePercent = activeLevel
    ? getLessonProgressPercent(progress, activeLevel.id)
    : 0;

  return {
    passedLevels: passed,
    totalLevels: levels.length,
    activeLevelName: activeLevel?.name ?? "",
    activePercent,
  };
}

export type HomeHeroCtas = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

/** Contextual home CTAs: guests start onboarding; returning users deep-link. */
export function buildHomeHeroCtas(input: {
  isLoggedIn: boolean;
  onboardingDone: boolean;
  continueHref: string | null;
  startLabel: string;
  browseLabel: string;
}): HomeHeroCtas {
  if (input.isLoggedIn && input.onboardingDone) {
    return {
      primaryHref: input.continueHref ?? "/inicio",
      primaryLabel: input.continueHref
        ? "Continuar aprendiendo"
        : "Ir a tu espacio",
      secondaryHref: "/inicio",
      secondaryLabel: "Tu espacio",
    };
  }

  return {
    primaryHref: "/onboarding",
    primaryLabel: input.startLabel,
    secondaryHref: "/learn",
    secondaryLabel: input.browseLabel,
  };
}

/** Primary CTA label on /inicio for the next guided step. */
export function resolveHubPrimaryCtaLabel(input: {
  hasNextItem: boolean;
  isFreshStart: boolean;
}): string {
  if (!input.hasNextItem) return "Ir al nivel";
  if (input.isFreshStart) return "Empezar el curso";
  return "Continuar aprendiendo";
}
