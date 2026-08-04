import { BRAND_VISUAL_TOKENS, SEO_COPY } from "@/lib/domain/brand-positioning";

export const PWA_ICON_SIZES = [192, 512] as const;

export type PwaIconSize = (typeof PWA_ICON_SIZES)[number];

export const PWA_SERVICE_WORKER_PATH = "/sw.js";

export interface WebAppManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: "any" | "maskable" | "monochrome";
}

export interface WebAppManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: "standalone";
  orientation: "portrait";
  theme_color: string;
  background_color: string;
  categories: string[];
  icons: WebAppManifestIcon[];
}

export function pwaIconPath(size: PwaIconSize): string {
  return `/pwa/icon-${size}.png`;
}

export function buildWebAppManifest(siteOrigin: string): WebAppManifest {
  const origin = siteOrigin.replace(/\/$/, "");

  return {
    id: `${origin}/`,
    name: SEO_COPY.title,
    short_name: "Migajas",
    description: SEO_COPY.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: BRAND_VISUAL_TOKENS.sage,
    background_color: BRAND_VISUAL_TOKENS.background,
    categories: ["education", "health"],
    icons: PWA_ICON_SIZES.map((size) => ({
      src: pwaIconPath(size),
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}
