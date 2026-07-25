import type { MetadataRoute } from "next";
import { getSiteUrl, getSitemapEntries } from "@/lib/domain/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return getSitemapEntries().map((entry) => ({
    url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
