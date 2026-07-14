import { describe, it, expect } from "vitest";
import {
  REGIONS,
  DEFAULT_REGION_ID,
  getRegionById,
  formatExchangeRule,
  resolveRegionIdFromOnboarding,
} from "@/lib/domain/regions";

describe("getRegionById", () => {
  it("returns Spain by default", () => {
    expect(getRegionById(null).id).toBe(DEFAULT_REGION_ID);
    expect(getRegionById("do").exchangeUnitG).toBe(15);
  });
});

describe("formatExchangeRule", () => {
  it("describes the exchange unit per region", () => {
    expect(formatExchangeRule(getRegionById("es"))).toBe(
      "10 g de carbohidratos = 1 ración",
    );
    expect(formatExchangeRule(getRegionById("do"))).toBe(
      "15 g de carbohidratos = 1 ración",
    );
  });
});

describe("resolveRegionIdFromOnboarding", () => {
  it("prefers regionId when present", () => {
    expect(resolveRegionIdFromOnboarding({ regionId: "do" })).toBe("do");
  });

  it("maps legacy country label", () => {
    expect(
      resolveRegionIdFromOnboarding({ country: "República Dominicana" }),
    ).toBe("do");
  });

  it("falls back to Spain", () => {
    expect(resolveRegionIdFromOnboarding(null)).toBe("es");
  });
});

describe("REGIONS", () => {
  it("includes Spain and Dominican Republic", () => {
    expect(REGIONS.map((region) => region.id)).toEqual(["es", "do"]);
  });
});
