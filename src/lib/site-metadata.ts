import type { Metadata } from "next";
import { SEO_COPY } from "@/lib/domain/brand-positioning";
import { getSiteUrl } from "@/lib/domain/seo";

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: SEO_COPY.title,
    description: SEO_COPY.description,
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
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
  };
}
