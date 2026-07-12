import { describe, it, expect } from "vitest";
import {
  EXCHANGE_UNIT_G,
  calculateRations,
  formatRations,
} from "@/lib/domain/rations";

describe("calculateRations", () => {
  it("returns 1.5 rations for 15g carbs with 10g unit", () => {
    expect(calculateRations(15)).toBe(1.5);
  });

  it("returns 0 rations for 0g carbs (protein modulator)", () => {
    expect(calculateRations(0)).toBe(0);
  });

  it("uses custom exchange unit when provided", () => {
    expect(calculateRations(12, 12)).toBe(1);
  });

  it("defaults exchange unit to 10g for Spain", () => {
    expect(EXCHANGE_UNIT_G).toBe(10);
  });
});

describe("formatRations", () => {
  it('formats 1.5 as "1.5"', () => {
    expect(formatRations(1.5)).toBe("1.5");
  });

  it('formats 1.0 as "1.0"', () => {
    expect(formatRations(1)).toBe("1.0");
  });
});
