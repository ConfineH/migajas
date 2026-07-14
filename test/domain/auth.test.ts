import { describe, it, expect } from "vitest";
import {
  resolveAuthMode,
  sanitizePostAuthRedirect,
  buildOAuthCallbackUrl,
  getAuthSiteOrigin,
  resolveAuthCallbackRedirect,
  formatUserDisplayName,
  type AuthUserSummary,
} from "@/lib/domain/auth";

describe("resolveAuthMode", () => {
  it("returns guest when user id is missing", () => {
    expect(resolveAuthMode(null)).toBe("guest");
    expect(resolveAuthMode(undefined)).toBe("guest");
    expect(resolveAuthMode("")).toBe("guest");
  });

  it("returns authenticated when user id is present", () => {
    expect(resolveAuthMode("user-123")).toBe("authenticated");
  });
});

describe("sanitizePostAuthRedirect", () => {
  it("allows internal relative paths", () => {
    expect(sanitizePostAuthRedirect("/learn")).toBe("/learn");
    expect(sanitizePostAuthRedirect("/onboarding")).toBe("/onboarding");
  });

  it("blocks external URLs", () => {
    expect(sanitizePostAuthRedirect("https://evil.com")).toBe("/learn");
    expect(sanitizePostAuthRedirect("//evil.com")).toBe("/learn");
  });

  it("falls back when next is empty", () => {
    expect(sanitizePostAuthRedirect(null)).toBe("/learn");
    expect(sanitizePostAuthRedirect(undefined)).toBe("/learn");
    expect(sanitizePostAuthRedirect("")).toBe("/learn");
  });

  it("uses custom fallback when provided", () => {
    expect(sanitizePostAuthRedirect(null, "/onboarding")).toBe("/onboarding");
  });
});

describe("buildOAuthCallbackUrl", () => {
  it("builds callback URL with encoded next path", () => {
    expect(buildOAuthCallbackUrl("https://migajas.app", "/onboarding")).toBe(
      "https://migajas.app/auth/callback?next=%2Fonboarding",
    );
  });

  it("omits next query when path is default", () => {
    expect(buildOAuthCallbackUrl("https://migajas.app", "/learn")).toBe(
      "https://migajas.app/auth/callback",
    );
  });
});

describe("getAuthSiteOrigin", () => {
  it("trims trailing slash from site url", () => {
    expect(getAuthSiteOrigin("https://migajas.vercel.app/")).toBe(
      "https://migajas.vercel.app",
    );
  });

  it("falls back when site url is missing", () => {
    expect(getAuthSiteOrigin(null)).toBe("http://localhost:3000");
  });
});

describe("resolveAuthCallbackRedirect", () => {
  it("prefers explicit next path", () => {
    expect(resolveAuthCallbackRedirect("/progress", "recovery")).toBe(
      "/progress",
    );
  });

  it("routes recovery flows to reset password", () => {
    expect(resolveAuthCallbackRedirect(null, "recovery")).toBe(
      "/auth/reset-password",
    );
  });

  it("routes signup confirmation to confirmed page", () => {
    expect(resolveAuthCallbackRedirect(null, "signup")).toBe("/auth/confirmed");
  });

  it("defaults to learn", () => {
    expect(resolveAuthCallbackRedirect(null, null)).toBe("/learn");
  });
});

describe("formatUserDisplayName", () => {
  it("prefers display name over email", () => {
    const user: AuthUserSummary = {
      id: "1",
      email: "ana@example.com",
      displayName: "Ana",
      provider: "google",
    };
    expect(formatUserDisplayName(user)).toBe("Ana");
  });

  it("falls back to email prefix", () => {
    const user: AuthUserSummary = {
      id: "1",
      email: "ana@example.com",
      displayName: null,
      provider: "google",
    };
    expect(formatUserDisplayName(user)).toBe("ana");
  });

  it("returns generic label when no identity fields", () => {
    const user: AuthUserSummary = {
      id: "1",
      email: null,
      displayName: null,
      provider: "google",
    };
    expect(formatUserDisplayName(user)).toBe("Usuario");
  });
});
