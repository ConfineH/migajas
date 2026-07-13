export type AuthMode = "guest" | "authenticated";

export interface AuthUserSummary {
  id: string;
  email: string | null;
  displayName: string | null;
  provider: string | null;
}

const DEFAULT_POST_AUTH_PATH = "/learn";

export function resolveAuthMode(
  userId: string | null | undefined,
): AuthMode {
  if (!userId) return "guest";
  return "authenticated";
}

export function sanitizePostAuthRedirect(
  next: string | null | undefined,
  fallback: string = DEFAULT_POST_AUTH_PATH,
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export function buildOAuthCallbackUrl(
  origin: string,
  next: string = DEFAULT_POST_AUTH_PATH,
): string {
  const safeNext = sanitizePostAuthRedirect(next);
  const base = `${origin.replace(/\/$/, "")}/auth/callback`;
  if (safeNext === DEFAULT_POST_AUTH_PATH) return base;
  return `${base}?next=${encodeURIComponent(safeNext)}`;
}

export function formatUserDisplayName(user: AuthUserSummary): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.email) return user.email.split("@")[0] ?? "Usuario";
  return "Usuario";
}
