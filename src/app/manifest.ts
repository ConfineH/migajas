import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/domain/seo";
import { buildWebAppManifest } from "@/lib/pwa/web-app-manifest";

export default function manifest(): MetadataRoute.Manifest {
  return buildWebAppManifest(getSiteUrl());
}
