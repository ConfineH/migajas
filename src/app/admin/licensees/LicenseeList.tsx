"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Licensee, LicenseeInput } from "@/lib/domain/licensees";
import {
  supportTierLabels,
  territoryLabels,
} from "@/lib/domain/licensees";
import { deleteLicenseeAction, saveLicenseeAction } from "@/app/admin/actions";
import { CollapsiblePanel } from "@/app/admin/CollapsiblePanel";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

interface LicenseeListProps {
  licensees: Licensee[];
}

const inputClass = "field-input mt-1 text-sm";

function LicenseeForm({
  licensee,
}: {
  licensee: Licensee | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(licensee?.name ?? "");
  const [territory, setTerritory] = useState<LicenseeInput["territory"]>(
    licensee?.territory ?? "es",
  );
  const [contractDate, setContractDate] = useState(licensee?.contractDate ?? "");
  const [supportTier, setSupportTier] = useState<LicenseeInput["supportTier"]>(
    licensee?.supportTier ?? "basic",
  );
  const [contactEmail, setContactEmail] = useState(licensee?.contactEmail ?? "");
  const [notes, setNotes] = useState(licensee?.notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const input: LicenseeInput = {
      name,
      territory,
      contractDate: contractDate || null,
      supportTier,
      contactEmail: contactEmail.trim() || null,
      notes,
    };

    const result = await saveLicenseeAction(licensee?.id ?? null, input);
    setSaving(false);
    setOk(result.ok);
    setMessage(result.ok ? "Guardado" : result.error);
    if (result.ok) router.refresh();
  }

  async function handleDelete() {
    if (!licensee) return;
    if (!window.confirm(`¿Eliminar licenciatario "${licensee.name}"?`)) return;
    setDeleting(true);
    setMessage(null);
    const result = await deleteLicenseeAction(licensee.id);
    setDeleting(false);
    setOk(result.ok);
    setMessage(result.ok ? "Eliminado" : result.error);
    if (result.ok) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Nombre / institución</span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Territorio</span>
          <select
            className={inputClass}
            value={territory}
            onChange={(e) => setTerritory(e.target.value as LicenseeInput["territory"])}
          >
            <option value="es">{territoryLabels.es}</option>
            <option value="do">{territoryLabels.do}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Nivel de soporte</span>
          <select
            className={inputClass}
            value={supportTier}
            onChange={(e) => setSupportTier(e.target.value as LicenseeInput["supportTier"])}
          >
            <option value="basic">{supportTierLabels.basic}</option>
            <option value="standard">{supportTierLabels.standard}</option>
            <option value="premium">{supportTierLabels.premium}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Fecha de contrato</span>
          <input
            type="date"
            className={inputClass}
            value={contractDate ?? ""}
            onChange={(e) => setContractDate(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Email de contacto</span>
          <input
            type="email"
            className={inputClass}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Notas</span>
          <textarea className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || deleting}
          className="btn-terracotta rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Guardando…" : licensee ? "Guardar cambios" : "Crear licenciatario"}
        </button>
        {licensee ? (
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleDelete}
            className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        ) : null}
        <SaveFeedback message={message} ok={ok} />
      </div>
    </form>
  );
}

export function LicenseeList({ licensees }: LicenseeListProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border p-5">
        <h2 className="mb-4 font-medium text-foreground">Nuevo licenciatario</h2>
        <LicenseeForm licensee={null} />
      </div>

      <div className="space-y-4">
        {licensees.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay licenciatarios registrados.</p>
        ) : (
          licensees.map((licensee) => (
            <CollapsiblePanel
              key={licensee.id}
              id={licensee.id}
              title={licensee.name}
              subtitle={`${territoryLabels[licensee.territory]} · ${supportTierLabels[licensee.supportTier]}${licensee.contractDate ? ` · ${licensee.contractDate}` : ""}`}
            >
              <LicenseeForm licensee={licensee} />
            </CollapsiblePanel>
          ))
        )}
      </div>
    </div>
  );
}
