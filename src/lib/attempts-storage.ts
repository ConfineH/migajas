import { cookies } from "next/headers";
import type { Attempt } from "@/lib/domain/attempts";

export const ATTEMPTS_COOKIE = "migajas_attempts";
const MAX_ATTEMPTS = 200;

export async function getStoredAttempts(): Promise<Attempt[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTEMPTS_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Attempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeAttempts(attempts: Attempt[]): string {
  return JSON.stringify(attempts.slice(-MAX_ATTEMPTS));
}
