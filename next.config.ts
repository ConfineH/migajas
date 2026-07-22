import type { NextConfig } from "next";
import { getSecurityHeaders } from "@/lib/security-headers";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
