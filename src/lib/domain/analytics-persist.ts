import type { LearningEvent } from "@/lib/domain/analytics";

export function buildLearningEventRecord(
  event: LearningEvent,
  userId: string,
): { user_id: string; event_type: LearningEvent["type"]; payload: LearningEvent } {
  return {
    user_id: userId,
    event_type: event.type,
    payload: event,
  };
}
