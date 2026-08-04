import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PWA_ICON_SIZES,
  PWA_SERVICE_WORKER_PATH,
  buildWebAppManifest,
} from "@/lib/pwa/web-app-manifest";
import { BRAND_VISUAL_TOKENS, SEO_COPY } from "@/lib/domain/brand-positioning";

const ROOT = join(__dirname, "..", "..");

describe("web app manifest", () => {
  it("uses canonical SEO copy and brand colors", () => {
    const manifest = buildWebAppManifest("https://migajas.vercel.app");

    expect(manifest.name).toBe(SEO_COPY.title);
    expect(manifest.short_name).toBe("Migajas");
    expect(manifest.description).toBe(SEO_COPY.description);
    expect(manifest.theme_color).toBe(BRAND_VISUAL_TOKENS.sage);
    expect(manifest.background_color).toBe(BRAND_VISUAL_TOKENS.background);
  });

  it("is installable: standalone display, scope, and required icon sizes", () => {
    const manifest = buildWebAppManifest("https://example.com");

    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.id).toBe("https://example.com/");

    const sizes = manifest.icons.map((icon) => icon.sizes);
    for (const required of PWA_ICON_SIZES) {
      expect(sizes).toContain(`${required}x${required}`);
    }
  });

  it("ships PNG icons under public/pwa", () => {
    for (const size of PWA_ICON_SIZES) {
      const path = join(ROOT, "public", "pwa", `icon-${size}.png`);
      expect(existsSync(path), `missing ${path}`).toBe(true);
    }
  });

  it("exposes a minimal service worker at a stable path", () => {
    expect(PWA_SERVICE_WORKER_PATH).toBe("/sw.js");
    const swPath = join(ROOT, "public", "sw.js");
    expect(existsSync(swPath)).toBe(true);
    const source = readFileSync(swPath, "utf8");
    expect(source).toMatch(/addEventListener\s*\(\s*['"]fetch['"]/);
  });
});
