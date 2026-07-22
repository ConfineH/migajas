import { describe, it, expect } from "vitest";
import {
  getIntakeRetentionDays,
  getIntakeExpirationCutoffDate,
} from "@/lib/domain/intake-retention";

describe("intake retention", () => {
  it("defaults to 365 days when env is missing", () => {
    expect(getIntakeRetentionDays(undefined)).toBe(365);
  });

  it("parses valid retention days from env", () => {
    expect(getIntakeRetentionDays("180")).toBe(180);
  });

  it("falls back for invalid env values", () => {
    expect(getIntakeRetentionDays("abc")).toBe(365);
    expect(getIntakeRetentionDays("0")).toBe(365);
  });

  it("computes expiration cutoff date", () => {
    const cutoff = getIntakeExpirationCutoffDate(
      30,
      new Date("2026-07-23T12:00:00.000Z"),
    );
    expect(cutoff).toBe("2026-06-23");
  });
});
