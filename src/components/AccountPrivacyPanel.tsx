"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export function AccountPrivacyPanel() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportAccountData() {
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "No se pudo exportar.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "migajas-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "¿Seguro que quieres eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "No se pudo eliminar la cuenta.");
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="feature-card space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg font-medium text-foreground">
          Privacidad y cuenta
        </h2>
        <p className="mt-1 text-sm text-muted">
          Exporta todos tus datos o elimina tu cuenta de forma permanente. También
          puedes gestionar cookies en la{" "}
          <Link
            href="/cookies"
            className="font-medium text-sage-strong underline-offset-2 hover:underline"
          >
            política de cookies
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          onClick={exportAccountData}
          className={busy ? "pointer-events-none opacity-50" : ""}
        >
          Exportar mis datos
        </Button>
        <Button
          variant="ghost"
          onClick={deleteAccount}
          className={busy ? "pointer-events-none opacity-50" : ""}
        >
          Eliminar cuenta
        </Button>
      </div>
    </section>
  );
}
