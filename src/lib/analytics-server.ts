import type { LearningEvent } from "@/lib/domain/analytics";

export function trackLearningEvent(event: LearningEvent): void {
  if (process.env.NODE_ENV === "test") return;
  console.info("[analytics]", JSON.stringify(event));
}
