"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import {
  PROFESSIONAL_ROLES,
  type ProfessionalRoleId,
} from "@/lib/domain/professional-profile";

export function ProfessionalActivateForm() {
  const router = useRouter();
  const [role, setRole] = useState<ProfessionalRoleId>(
    PROFESSIONAL_ROLES[0]?.id ?? "otro",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const response = await fetch("/api/professional/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professional_role: role }),
    });
    const payload = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo crear el perfil.");
      return;
    }
    router.push("/profesional");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="feature-card space-y-5 p-6 sm:p-8">
      <fieldset className="space-y-3">
        <legend className="font-medium text-foreground">Tu ámbito</legend>
        {PROFESSIONAL_ROLES.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 text-sm"
          >
            <input
              type="radio"
              name="professional_role"
              value={item.id}
              checked={role === item.id}
              onChange={() => setRole(item.id)}
              className="mt-1"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Guardando…" : "Crear perfil profesional"}
      </Button>
    </form>
  );
}
