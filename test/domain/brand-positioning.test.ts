import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  ACTIVE_BRAND_SOURCES,
  BRAND_DOC_FILES,
  BRAND_ONE_LINER,
  BRAND_TAGLINE,
  BRAND_VISUAL_TOKENS,
  CONTENT_LIBRARY_FILES,
  CONTENT_MIX,
  EDITORIAL_SERIES,
  FORBIDDEN_MARKETING_PATTERNS,
  HERO_COPY,
  MARKETING_BRAND_SOURCES,
  ONBOARDING_COPY,
  PRODUCT_ARC,
  SEO_COPY,
  SOCIAL_COPY,
  findForbiddenMarketingPhrases,
} from "@/lib/domain/brand-positioning";

const ROOT = join(__dirname, "..", "..");

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("brand-positioning", () => {
  it("exposes the entender → practicar → confiar arc", () => {
    expect(PRODUCT_ARC).toEqual(["entender", "practicar", "confiar"]);
  });

  it("detects forbidden clinical and SaaS marketing phrases", () => {
    expect(findForbiddenMarketingPhrases("Controla tu diabetes hoy")).toContain(
      FORBIDDEN_MARKETING_PATTERNS[0].source,
    );
    expect(findForbiddenMarketingPhrases("Aprende a contar carbohidratos")).toEqual(
      [],
    );
  });

  it("canonical hero copy uses tagline and aligned subtitle", () => {
    expect(HERO_COPY.headline).toBe(BRAND_TAGLINE);
    expect(HERO_COPY.subtitle).toMatch(/curso guiado/i);
    expect(HERO_COPY.subtitle).toMatch(/comida real/i);
    expect(HERO_COPY.subtitle).toMatch(/tranquilidad/i);
    expect(findForbiddenMarketingPhrases(HERO_COPY.headline)).toEqual([]);
    expect(findForbiddenMarketingPhrases(HERO_COPY.subtitle)).toEqual([]);
  });

  it("SEO and onboarding share the one-liner value proposition", () => {
    expect(SEO_COPY.description).toBe(BRAND_ONE_LINER);
    expect(ONBOARDING_COPY.welcomeIntro).toBe(BRAND_ONE_LINER);
    expect(SEO_COPY.title).toMatch(/Aprende contando carbohidratos/i);
    expect(SEO_COPY.openGraphDescription).toMatch(/curso guiado/i);
    expect(findForbiddenMarketingPhrases(SEO_COPY.description)).toEqual([]);
    expect(findForbiddenMarketingPhrases(SEO_COPY.openGraphDescription)).toEqual(
      [],
    );
  });

  it("social copy stays educational for Instagram bio", () => {
    expect(SOCIAL_COPY.category).toBe("Educación");
    expect(SOCIAL_COPY.bio).toMatch(/comida real/i);
    expect(findForbiddenMarketingPhrases(SOCIAL_COPY.bio)).toEqual([]);
  });

  it("active brand sources import canonical copy", () => {
    const home = readSource("src/components/home/HomeAnimated.tsx");
    expect(home).toContain("HERO_COPY");
    expect(home).toContain("@/lib/domain/brand-positioning");

    const onboarding = readSource("src/components/OnboardingFlow.tsx");
    expect(onboarding).toContain("ONBOARDING_COPY");
    expect(onboarding).toContain("@/lib/domain/brand-positioning");

    const layout = readSource("src/app/layout.tsx");
    expect(layout).toContain("SEO_COPY");
    expect(layout).toContain("@/lib/domain/brand-positioning");

    const og = readSource("src/app/opengraph-image.tsx");
    expect(og).toContain("BRAND_TAGLINE");
    expect(og).toContain("SEO_COPY");
  });

  it("marketing brand sources avoid forbidden headline patterns", () => {
    for (const path of MARKETING_BRAND_SOURCES) {
      const content = readSource(path);
      const violations = findForbiddenMarketingPhrases(content);
      expect(
        violations,
        `${path} contains forbidden phrases: ${violations.join(", ")}`,
      ).toEqual([]);
    }
  });

  it("visual tokens align with globals.css palette", () => {
    const css = readSource("src/app/globals.css");
    expect(css).toContain(BRAND_VISUAL_TOKENS.background);
    expect(css).toContain(BRAND_VISUAL_TOKENS.sage);
    expect(css).toContain(BRAND_VISUAL_TOKENS.terracotta);
  });

  it("editorial series and content mix are defined", () => {
    expect(EDITORIAL_SERIES).toHaveLength(6);
    expect(EDITORIAL_SERIES[0]).toBe("la-porcion");
    expect(CONTENT_MIX.education).toBe(60);
    expect(CONTENT_MIX.product).toBe(10);
  });

  it("brand documentation kit exists", () => {
    for (const relativePath of BRAND_DOC_FILES) {
      expect(existsSync(join(ROOT, relativePath)), `Missing ${relativePath}`).toBe(
        true,
      );
    }
  });

  it("content library starter files exist", () => {
    for (const relativePath of CONTENT_LIBRARY_FILES) {
      expect(existsSync(join(ROOT, relativePath)), `Missing ${relativePath}`).toBe(
        true,
      );
    }
  });
});
