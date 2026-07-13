import { redirect } from "next/navigation";
import { resolveProgress } from "@/lib/learning-state";
import { isFreeModeUnlocked, toGuidedProgress } from "@/lib/domain/guided-flow";

export async function requireFreeMode(redirectTo = "/learn") {
  const progress = await resolveProgress();
  if (!isFreeModeUnlocked(toGuidedProgress(progress))) {
    redirect(redirectTo);
  }
}

export async function getFreeModeStatus(): Promise<boolean> {
  const progress = await resolveProgress();
  return isFreeModeUnlocked(toGuidedProgress(progress));
}
