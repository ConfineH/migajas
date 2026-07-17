const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export interface AppCookieOptions {
  httpOnly: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
  secure: boolean;
}

export function isProductionEnv(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv === "production";
}

export function getAppCookieOptions(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): AppCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
    secure: isProductionEnv(nodeEnv),
  };
}
