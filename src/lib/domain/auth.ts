export type AuthMode = "guest" | "authenticated";

export interface AuthUserSummary {
  id: string;
  email: string | null;
  displayName: string | null;
  provider: string | null;
}

const DEFAULT_POST_AUTH_PATH = "/inicio";

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

export function getAuthSiteOrigin(
  siteUrl: string | null | undefined,
  fallback = "http://localhost:3000",
): string {
  const trimmed = siteUrl?.trim().replace(/\/$/, "");
  return trimmed || fallback;
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

export function resolveAuthCallbackRedirect(
  next: string | null | undefined,
  type: string | null | undefined,
): string {
  if (next) return sanitizePostAuthRedirect(next);
  if (type === "recovery") return "/auth/reset-password";
  if (type === "signup" || type === "email") return "/auth/confirmed";
  return DEFAULT_POST_AUTH_PATH;
}

export function formatUserDisplayName(user: AuthUserSummary): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.email) return user.email.split("@")[0] ?? "Usuario";
  return "Usuario";
}
