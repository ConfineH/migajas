import { describe, it, expect } from "vitest";
import { parseExportRange } from "@/lib/domain/clinical-report";

describe("parseExportRange presets (commercial-hardening)", () => {
  it("parses 30d preset ending on anchor date", () => {
    const result = parseExportRange("30d", undefined, undefined, new Date("2026-07-14"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.to).toBe("2026-07-14");
      expect(result.from).toBe("2026-06-15");
    }
  });
});
