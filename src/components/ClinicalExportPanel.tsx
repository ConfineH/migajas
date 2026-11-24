"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  patientRecipientLabel,
  type PatientRecipientLabelId,
  type RecipientRepeatMode,
} from "@/lib/domain/professional-profile";

type ExportRange = "7d" | "30d" | "custom";

interface ShareRecipient {
  professional_user_id: string;
  share_code: string | null;
  label_id: PatientRecipientLabelId;
  title: string;
  last_sent_label: string;
  share_count: number;
  preview: string | null;
  can_resend: boolean;
  has_copies: boolean;
  repeat_mode: RecipientRepeatMode | null;
  repeat_due_label: string | null;
  due: boolean;
}

function savedPreference(mode: RecipientRepeatMode | null): string | null {
  if (mode === "next_month") {
    return "Preferencia guardada: el mes que viene. Esta preferencia no envía un informe.";
  }
  if (mode === "monthly") {
    return "Preferencia guardada: todos los meses. Esta preferencia no envía un informe.";
  }
  return null;
}

export function ClinicalExportPanel() {
  const [range, setRange] = useState<ExportRange>("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [recipientsLoaded, setRecipientsLoaded] = useState(false);
  const [revokeBusyId, setRevokeBusyId] = useState<string | null>(null);

  const loadRecipients = useCallback(async () => {
    const response = await fetch("/api/professional/shares");
    const payload = (await response.json()) as {
      error?: string;
      recipients?: ShareRecipient[];
    };
    if (!response.ok) {
      setRecipients([]);
      setRecipientsLoaded(true);
      return;
    }
    setRecipients(payload.recipients ?? []);
    setRecipientsLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/professional/shares")
      .then(async (response) => {
        const payload = (await response.json()) as {
          recipients?: ShareRecipient[];
        };
        if (!active) return;
        if (!response.ok) {
          setRecipients([]);
          setRecipientsLoaded(true);
          return;
        }
        setRecipients(payload.recipients ?? []);
        setRecipientsLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setRecipients([]);
        setRecipientsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

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

  async function handleRevoke(recipient: ShareRecipient) {
    if (
      !window.confirm(
        `¿Retirar el acceso a ${recipient.title}? Se borrarán las copias que tenga.`,
      )
    ) {
      return;
    }
    setError(null);
    setRevokeBusyId(recipient.professional_user_id);
    const response = await fetch("/api/professional/shares", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_user_id: recipient.professional_user_id,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setRevokeBusyId(null);
    if (!response.ok) {
      setError(payload.error ?? "No se pudieron borrar las copias.");
      return;
    }
    await loadRecipients();
  }

  return (
    <section className="callout-sage space-y-4">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Informe para tu equipo de salud
        </h2>
        <p className="mt-1 text-sm text-muted">
          Puedes descargarlo en CSV o PDF. El envío de informes nuevos está
          suspendido. Si ya enviaste alguno, sigues viendo a quién y puedes
          retirar ese acceso.
        </p>
      </div>

      {recipientsLoaded && recipients.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Tu equipo en el diario
          </h3>
          <ul className="space-y-2">
            {recipients.map((recipient) => {
              const preference = savedPreference(recipient.repeat_mode);
              const label = patientRecipientLabel(recipient.label_id);
              return (
                <li
                  key={recipient.professional_user_id}
                  className="rounded-2xl bg-surface px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {recipient.title}
                  </p>
                  {label ? (
                    <p className="mt-1 text-sm text-muted">Para ti es {label}.</p>
                  ) : null}
                  {preference ? (
                    <p className="mt-1 text-sm text-muted">{preference}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">
                    {recipient.has_copies
                      ? `Último envío: ${recipient.last_sent_label}`
                      : "Sin copias ahora"}
                    {recipient.share_count > 1
                      ? ` · ${recipient.share_count} informes`
                      : ""}
                  </p>
                  {recipient.has_copies ? (
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleRevoke(recipient)}
                        disabled={revokeBusyId === recipient.professional_user_id}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {revokeBusyId === recipient.professional_user_id
                          ? "Retirando…"
                          : "Retirar acceso"}
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : recipientsLoaded ? (
        <p className="text-sm text-muted">
          Todavía no hay destinatarios guardados. El envío de informes nuevos
          está suspendido.
        </p>
      ) : null}

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
