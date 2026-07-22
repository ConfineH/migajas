export interface SecurityHeader {
  key: string;
  value: string;
}

const BASE_SECURITY_HEADERS: SecurityHeader[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const HSTS_HEADER: SecurityHeader = {
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
};

export function isProductionEnv(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv === "production";
}

export function getSecurityHeaders(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): SecurityHeader[] {
  if (isProductionEnv(nodeEnv)) {
    return [...BASE_SECURITY_HEADERS, HSTS_HEADER];
  }
  return [...BASE_SECURITY_HEADERS];
}
