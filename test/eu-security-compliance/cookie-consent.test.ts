import { describe, it, expect } from "vitest";
import {
  hasCookieConsent,
  parseCookieConsent,
} from "@/lib/domain/cookie-consent";

describe("cookie consent", () => {
  it("parses accepted and essential values", () => {
    expect(parseCookieConsent("accepted")).toBe("accepted");
    expect(parseCookieConsent("essential")).toBe("essential");
    expect(parseCookieConsent("unknown")).toBeNull();
  });

  it("detects when consent was recorded", () => {
    expect(hasCookieConsent("accepted")).toBe(true);
    expect(hasCookieConsent(null)).toBe(false);
  });
});
