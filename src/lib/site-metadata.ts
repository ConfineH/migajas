import type { Metadata, Viewport } from "next";
import { BRAND_VISUAL_TOKENS, SEO_COPY } from "@/lib/domain/brand-positioning";
import { getSiteUrl } from "@/lib/domain/seo";

export function buildRootViewport(): Viewport {
  return {
    themeColor: BRAND_VISUAL_TOKENS.sage,
    width: "device-width",
    initialScale: 1,
  };
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    applicationName: "Migajas",
    title: SEO_COPY.title,
    description: SEO_COPY.description,
    appleWebApp: {
      capable: true,
      title: "Migajas",
      statusBarStyle: "default",
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: "Migajas",
      title: SEO_COPY.title,
      description: SEO_COPY.openGraphDescription,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: SEO_COPY.title,
      description: SEO_COPY.description,
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
    },
  };
}
