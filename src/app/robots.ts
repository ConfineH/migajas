import type { MetadataRoute } from "next";
import {
  getSiteUrl,
  ROBOTS_DISALLOW_PREFIXES,
} from "@/lib/domain/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW_PREFIXES],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
