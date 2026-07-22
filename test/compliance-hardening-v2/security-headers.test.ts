import { describe, it, expect } from "vitest";
import { getSecurityHeaders } from "@/lib/security-headers";

describe("security headers", () => {
  it("includes HSTS in production", () => {
    const headers = getSecurityHeaders("production");
    expect(headers.some((h) => h.key === "Strict-Transport-Security")).toBe(
      true,
    );
  });

  it("omits HSTS in development", () => {
    const headers = getSecurityHeaders("development");
    expect(headers.some((h) => h.key === "Strict-Transport-Security")).toBe(
      false,
    );
  });
});
