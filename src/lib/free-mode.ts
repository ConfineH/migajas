import { redirect } from "next/navigation";
import { getStoredProgress } from "@/lib/progress-storage";
import { isFreeModeUnlocked, toGuidedProgress } from "@/lib/domain/guided-flow";

export async function requireFreeMode(redirectTo = "/learn/nivel-1") {
  const progress = await getStoredProgress();
  if (!isFreeModeUnlocked(toGuidedProgress(progress))) {
    redirect(redirectTo);
  }
}

export async function getFreeModeStatus(): Promise<boolean> {
  const progress = await getStoredProgress();
  return isFreeModeUnlocked(toGuidedProgress(progress));
}
