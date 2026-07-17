"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type ExportRange = "7d" | "30d" | "custom";

export function ClinicalExportPanel() {
  const [range, setRange] = useState<ExportRange>("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="callout-sage space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Exportar reporte
        </h2>
        <p className="mt-1 text-sm text-muted">
          Descarga un resumen en CSV o PDF para compartir con tu equipo de salud.
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

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => handleDownload("csv")}>
          Descargar CSV
        </Button>
        <Button onClick={() => handleDownload("pdf")}>Descargar PDF</Button>
      </div>
    </section>
  );
}
