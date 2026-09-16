"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type ExportRange = "7d" | "30d" | "custom";

export function ClinicalExportPanel() {
  const [range, setRange] = useState<ExportRange>("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareDone, setShareDone] = useState(false);

  function resetSharePreview() {
    setPreview(null);
    setConfirmed(false);
    setShareDone(false);
  }

  function buildExportUrl(format: "csv" | "pdf"): string | null {
    setError(null);
    const params = new URLSearchParams({ format, range });
    if (range === "custom") {
      if (!from || !to) {
        setError("Indica fecha inicial y final para el rango personalizado.");
        return null;
      }
      params.set("from", from);
      params.set("to", to);
    }
    return `/api/clinical/export?${params.toString()}`;
  }

  function handleDownload(format: "csv" | "pdf") {
    const url = buildExportUrl(format);
    if (!url) return;
    window.location.href = url;
  }

  async function handleLookup() {
    setError(null);
    setShareDone(false);
    setShareBusy(true);
    const response = await fetch("/api/professional/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ share_code: shareCode }),
    });
    const payload = (await response.json()) as { error?: string; summary?: string };
    setShareBusy(false);
    if (!response.ok || !payload.summary) {
      setPreview(null);
      setConfirmed(false);
      setError(payload.error ?? "No se pudo comprobar el código.");
      return;
    }
    setPreview(payload.summary);
    setConfirmed(false);
  }

  async function handleShare() {
    setError(null);
    setShareDone(false);
    setShareBusy(true);
    const response = await fetch("/api/professional/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        share_code: shareCode,
        confirm: confirmed,
        range,
        from: range === "custom" ? from : undefined,
        to: range === "custom" ? to : undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setShareBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo enviar el informe.");
      return;
    }
    setShareDone(true);
  }

  return (
    <section className="callout-sage space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Informe para tu equipo de salud
        </h2>
        <p className="mt-1 text-sm text-muted">
          Descárgalo o envíaselo a tu profesional con el código que te haya dado.
          Migajas no lo manda sola.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["7d", "Últimos 7 días"],
            ["30d", "Últimos 30 días"],
            ["custom", "Personalizado"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRange(value)}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              range === value
                ? "bg-surface text-foreground shadow-soft"
                : "bg-sage-muted/30 text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="field-input"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="field-input"
            />
          </label>
        </div>
      ) : null}

      <label className="block space-y-1 text-sm">
        <span className="font-medium text-foreground">
          Código de tu profesional
        </span>
        <input
          value={shareCode}
          onChange={(event) => {
            setShareCode(event.target.value.toUpperCase());
            resetSharePreview();
          }}
          className="field-input font-mono tracking-widest"
          placeholder="ABCDE2"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {preview ? (
        <label className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-1"
          />
          <span>
            {preview} Confirmo que quiero enviarlo.
          </span>
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {shareDone ? (
        <p className="text-sm text-sage-strong">
          Informe enviado. Tu profesional lo verá en su perfil.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => handleDownload("csv")}>
          Descargar CSV
        </Button>
        <Button onClick={() => handleDownload("pdf")}>Descargar PDF</Button>
        {!preview ? (
          <Button
            variant="ghost"
            onClick={() => void handleLookup()}
            disabled={shareBusy || shareCode.trim().length < 6}
          >
            {shareBusy ? "Comprobando…" : "Comprobar destinatario"}
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => void handleShare()}
            disabled={shareBusy || !confirmed}
          >
            {shareBusy ? "Enviando…" : "Enviar al profesional"}
          </Button>
        )}
      </div>
    </section>
  );
}
