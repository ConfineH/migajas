"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  PATIENT_RECIPIENT_LABELS,
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
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [recipientsLoaded, setRecipientsLoaded] = useState(false);
  const [revokeBusyId, setRevokeBusyId] = useState<string | null>(null);
  const [labelBusyId, setLabelBusyId] = useState<string | null>(null);

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
    void loadRecipients();
  }, [loadRecipients]);

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

  function handleSelectRecipient(recipient: ShareRecipient) {
    if (!recipient.share_code || !recipient.preview) return;
    setError(null);
    setShareCode(recipient.share_code);
    setPreview(recipient.preview);
    setConfirmed(false);
    setShareDone(false);
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
    await loadRecipients();
  }

  async function handleLabelChange(
    recipient: ShareRecipient,
    label: PatientRecipientLabelId,
  ) {
    if (label === recipient.label_id) return;
    setError(null);
    setLabelBusyId(recipient.professional_user_id);
    const response = await fetch("/api/professional/shares", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_user_id: recipient.professional_user_id,
        label,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setLabelBusyId(null);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo guardar esa etiqueta.");
      return;
    }
    await loadRecipients();
  }

  async function handleRepeatChange(
    recipient: ShareRecipient,
    repeatMode: RecipientRepeatMode | null,
  ) {
    if (repeatMode === recipient.repeat_mode) return;
    setError(null);
    setLabelBusyId(recipient.professional_user_id);
    const response = await fetch("/api/professional/shares", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_user_id: recipient.professional_user_id,
        repeat_mode: repeatMode,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setLabelBusyId(null);
    if (!response.ok) {
      setError(payload.error ?? "No se pudo guardar el recordatorio.");
      return;
    }
    await loadRecipients();
  }

  async function handleRevoke(recipient: ShareRecipient) {
    if (
      !window.confirm(
        `¿Retirar el acceso a ${recipient.title}? Se borrarán las copias que tenga. Seguirá en tu lista para poder enviarle otro informe.`,
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
    if (shareCode && shareCode === recipient.share_code) {
      resetSharePreview();
      setShareCode("");
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
          Descárgalo o envíaselo a tu profesional con el código que te haya dado.
          Puedes marcar que te recuerde el mes que viene o todos los meses. Tú
          envías; Migajas no manda sola.
        </p>
      </div>

      {recipientsLoaded && recipients.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Tu equipo en el diario
          </h3>
          <ul className="space-y-2">
            {recipients.map((recipient) => (
              <li
                key={recipient.professional_user_id}
                className="rounded-2xl bg-surface px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">
                  {recipient.title}
                </p>
                {recipient.due ? (
                  <p className="mt-1 text-sm font-medium text-terracotta-dark">
                    Toca enviarle el informe de este mes.
                  </p>
                ) : null}
                <label className="mt-2 block space-y-1 text-sm">
                  <span className="text-muted">Para ti es</span>
                  <select
                    value={recipient.label_id}
                    disabled={labelBusyId === recipient.professional_user_id}
                    onChange={(event) =>
                      void handleLabelChange(
                        recipient,
                        event.target.value as PatientRecipientLabelId,
                      )
                    }
                    className="field-input py-2"
                  >
                    {PATIENT_RECIPIENT_LABELS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 space-y-2">
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={recipient.repeat_mode === "next_month"}
                      disabled={labelBusyId === recipient.professional_user_id}
                      onChange={(event) =>
                        void handleRepeatChange(
                          recipient,
                          event.target.checked ? "next_month" : null,
                        )
                      }
                    />
                    <span>Mandar otra vez el mes que viene</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={recipient.repeat_mode === "monthly"}
                      disabled={labelBusyId === recipient.professional_user_id}
                      onChange={(event) =>
                        void handleRepeatChange(
                          recipient,
                          event.target.checked ? "monthly" : null,
                        )
                      }
                    />
                    <span>Mandar todos los meses</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {recipient.has_copies
                    ? `Último envío: ${recipient.last_sent_label}`
                    : "Sin copias ahora"}
                  {recipient.share_count > 1
                    ? ` · ${recipient.share_count} informes`
                    : ""}
                  {recipient.repeat_due_label && !recipient.due
                    ? ` · te lo recuerdo el ${recipient.repeat_due_label}`
                    : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {recipient.can_resend ? (
                    <button
                      type="button"
                      onClick={() => handleSelectRecipient(recipient)}
                      className="text-sm font-medium text-sage-strong hover:underline"
                    >
                      Enviar {recipient.due ? "ahora" : "otra vez"}
                    </button>
                  ) : null}
                  {recipient.has_copies ? (
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
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : recipientsLoaded ? (
        <p className="text-sm text-muted">
          Cuando envíes un informe, esa persona aparecerá aquí. Podrás marcar si
          es tu endocrino, médico de cabecera, enfermería o nutricionista.
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
