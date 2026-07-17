import { cookies } from "next/headers";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import {
  COOKIE_CONSENT_COOKIE,
  hasCookieConsent,
} from "@/lib/domain/cookie-consent";

export async function CookieConsentGate() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_CONSENT_COOKIE)?.value;
  if (hasCookieConsent(value)) {
    return null;
  }

  return <CookieConsentBanner />;
}
