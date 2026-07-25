import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  PUBLIC_PAGE_SEO,
  ROBOTS_DISALLOW_PREFIXES,
  buildCourseJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  getLearnLevelSeo,
  getSitemapEntries,
  getSiteUrl,
  validatePublicSeoCopy,
} from "@/lib/domain/seo";

const ROOT = join(__dirname, "..", "..");

describe("seo", () => {
  it("resolves site URL from env or default", () => {
    expect(getSiteUrl()).toMatch(/^https:\/\//);
  });

  it("lists public funnel pages in sitemap", () => {
    const paths = getSitemapEntries().map((entry) => entry.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/onboarding");
    expect(paths).toContain("/learn");
    expect(paths).toContain("/learn/nivel-1");
    expect(paths).toContain("/guia");
    expect(paths).not.toContain("/admin");
    expect(paths).not.toContain("/diario");
  });

  it("blocks private areas in robots disallow list", () => {
    expect(ROBOTS_DISALLOW_PREFIXES).toContain("/admin");
    expect(ROBOTS_DISALLOW_PREFIXES).toContain("/api");
    expect(ROBOTS_DISALLOW_PREFIXES).toContain("/login");
    expect(ROBOTS_DISALLOW_PREFIXES).toContain("/catalog");
  });

  it("builds page metadata with canonical URL", () => {
    const meta = buildPageMetadata(PUBLIC_PAGE_SEO.learn);
    expect(meta.title).toMatch(/Curso guiado/i);
    expect(meta.description).toMatch(/carbohidratos/i);
    expect(meta.alternates?.canonical).toMatch(/\/learn$/);
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("supports noindex metadata for private surfaces", () => {
    const meta = buildPageMetadata(PUBLIC_PAGE_SEO.home, { noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("describes learn levels from curriculum data", () => {
    const nivel1 = getLearnLevelSeo("nivel-1");
    expect(nivel1?.path).toBe("/learn/nivel-1");
    expect(nivel1?.title).toMatch(/Nivel 1/i);
    expect(nivel1?.description).toMatch(/educativo/i);
  });

  it("exposes JSON-LD for organization and course", () => {
    const siteUrl = "https://migajas.vercel.app";
    const org = buildOrganizationJsonLd(siteUrl);
    const course = buildCourseJsonLd(siteUrl);

    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Migajas");
    expect(course["@type"]).toBe("Course");
    expect(course.url).toBe(`${siteUrl}/learn`);
    expect(course.isAccessibleForFree).toBe(true);
  });

  it("keeps public SEO copy free of forbidden marketing phrases", () => {
    expect(validatePublicSeoCopy()).toEqual([]);
  });

  it("ships robots.txt and sitemap.xml routes", () => {
    expect(existsSync(join(ROOT, "src/app/robots.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "src/app/sitemap.ts"))).toBe(true);
  });

  it("uses educational onboarding title not settings wording", () => {
    expect(PUBLIC_PAGE_SEO.onboarding.title).toMatch(/Empezar/i);
    expect(PUBLIC_PAGE_SEO.onboarding.title).not.toMatch(/Configuración/i);
  });
});
