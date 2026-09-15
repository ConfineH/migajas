"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export function ProfessionalContactForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDone(false);
    setBusy(true);
    const response = await fetch("/api/professional/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const payload = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo enviar.");
      return;
    }
    setDone(true);
    setSubject("");
    setBody("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-foreground">Asunto</span>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="field-input"
          required
          maxLength={120}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium text-foreground">Mensaje</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="field-input min-h-32"
          required
          minLength={20}
          maxLength={2000}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {done ? (
        <p className="text-sm text-sage-strong">
          Mensaje enviado al equipo de Migajas.
        </p>
      ) : null}
      <Button type="submit" disabled={busy} variant="secondary">
        {busy ? "Enviando…" : "Escribir a administración"}
      </Button>
    </form>
  );
}
