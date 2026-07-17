"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(true);

  async function saveConsent(value: "accepted" | "essential") {
    await fetch("/api/cookie-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface p-4 shadow-soft sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p id="cookie-consent-title" className="font-medium text-foreground">
            Cookies y privacidad
          </p>
          <p className="mt-1 text-sm text-muted">
            Usamos cookies técnicas para sesión, progreso y preferencias.
            Consulta nuestra{" "}
            <Link
              href="/privacidad"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              política de privacidad
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => saveConsent("essential")}>
            Solo necesarias
          </Button>
          <Button onClick={() => saveConsent("accepted")}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
