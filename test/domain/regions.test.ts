import { describe, it, expect } from "vitest";
import {
  REGIONS,
  DEFAULT_REGION_ID,
  getRegionById,
  formatExchangeRule,
  regionIdFromQuery,
  recommendCourseUrl,
  resolveOnboardingRegionId,
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

describe("resolveOnboardingRegionId", () => {
  it("preselects a valid recommendation before onboarding is done", () => {
    expect(
      resolveOnboardingRegionId({
        queryRegion: "do",
        state: { regionId: "es" },
      }),
    ).toBe("do");
  });

  it("ignores an unknown recommendation", () => {
    expect(regionIdFromQuery("fr")).toBeNull();
    expect(regionIdFromQuery(" DO ")).toBe("do");
    expect(resolveOnboardingRegionId({ queryRegion: "fr" })).toBe("es");
  });

  it("keeps the account country over the link", () => {
    expect(
      resolveOnboardingRegionId({
        accountRegionId: "es",
        queryRegion: "do",
      }),
    ).toBe("es");
  });

  it("keeps the saved country once onboarding is complete", () => {
    expect(
      resolveOnboardingRegionId({
        queryRegion: "do",
        onboardingCompleted: true,
        state: { regionId: "es" },
      }),
    ).toBe("es");
  });
});

describe("recommendCourseUrl", () => {
  it("builds an onboarding link with the account country", () => {
    expect(
      recommendCourseUrl("https://migajas.vercel.app/", "do"),
    ).toBe("https://migajas.vercel.app/onboarding?region=do");
  });

  it("falls back to Spain when the country is unknown", () => {
    expect(recommendCourseUrl("https://migajas.vercel.app", "fr")).toBe(
      "https://migajas.vercel.app/onboarding?region=es",
    );
  });
});

describe("REGIONS", () => {
  it("includes Spain and Dominican Republic", () => {
    expect(REGIONS.map((region) => region.id)).toEqual(["es", "do"]);
  });
});
