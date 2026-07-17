import { describe, it, expect } from "vitest";
import { getAppCookieOptions, isProductionEnv } from "@/lib/cookie-options";

describe("cookie options", () => {
  it("marks cookies secure in production", () => {
    expect(getAppCookieOptions("production").secure).toBe(true);
    expect(isProductionEnv("production")).toBe(true);
  });

  it("keeps cookies non-secure in development", () => {
    expect(getAppCookieOptions("development").secure).toBe(false);
    expect(isProductionEnv("development")).toBe(false);
  });
});
