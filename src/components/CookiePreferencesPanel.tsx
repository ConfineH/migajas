"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Preference = "accepted" | "essential";

interface CookiePreferencesPanelProps {
  initialPreference?: Preference | null;
}

export function CookiePreferencesPanel({
  initialPreference = null,
}: CookiePreferencesPanelProps) {
  const [preference, setPreference] = useState<Preference | null>(
    initialPreference,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveConsent(value: Preference) {
    setError(null);
    setSaved(false);
    const response = await fetch("/api/cookie-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "No se pudo guardar la preferencia.");
      return;
    }
    setPreference(value);
    setSaved(true);
  }

  return (
    <section className="not-prose space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Configuración de cookies
        </h2>
        <p className="mt-1 text-sm text-muted">
          Puedes cambiar tu decisión en cualquier momento. Las cookies esenciales
          son necesarias para el funcionamiento del curso y la sesión.
        </p>
      </div>

      {preference ? (
        <p className="text-sm text-muted">
          Preferencia actual:{" "}
          <span className="font-medium text-foreground">
            {preference === "accepted" ? "Todas las necesarias" : "Solo necesarias"}
          </span>
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="text-sm text-sage-strong">Preferencia guardada.</p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={() => saveConsent("essential")}>
          Solo necesarias
        </Button>
        <Button onClick={() => saveConsent("accepted")}>Aceptar</Button>
      </div>
    </section>
  );
}
