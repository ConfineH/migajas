"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FoodCountry } from "@/lib/domain/content-admin";
import type { Difficulty, ItemType } from "@/lib/domain/foods";
import { calculateRations } from "@/lib/domain/rations";
import { createFoodAction } from "@/app/admin/actions";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

const inputClass = "field-input mt-1 text-sm";

export function FoodCreateForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [country, setCountry] = useState<FoodCountry>("España");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [portionText, setPortionText] = useState("");
  const [grams, setGrams] = useState("100");
  const [carbsG, setCarbsG] = useState("10");
  const [difficulty, setDifficulty] = useState<Difficulty>("Baja");
  const [itemType, setItemType] = useState<ItemType>("base");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const previewRations = calculateRations(Number(carbsG) || 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await createFoodAction({
      id,
      country,
      name,
      category,
      portionText,
      grams: Number(grams),
      carbsG: Number(carbsG),
      difficulty,
      itemType,
      notes,
    });

    setSaving(false);
    setOk(result.ok);
    setMessage(result.ok ? "Alimento creado" : result.error);
    if (result.ok) {
      setId("");
      setName("");
      setCategory("");
      setPortionText("");
      setNotes("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border p-5">
      <h2 className="font-medium text-foreground">Añadir alimento</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">ID (slug)</span>
          <input
            className={inputClass}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ej. pan-casero"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">País</span>
          <select
            className={inputClass}
            value={country}
            onChange={(e) => setCountry(e.target.value as FoodCountry)}
          >
            <option value="España">España</option>
            <option value="República Dominicana">República Dominicana</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Nombre</span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Categoría</span>
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Porción</span>
          <input className={inputClass} value={portionText} onChange={(e) => setPortionText(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Gramos</span>
          <input type="number" className={inputClass} value={grams} onChange={(e) => setGrams(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Carbohidratos (g)</span>
          <input type="number" className={inputClass} value={carbsG} onChange={(e) => setCarbsG(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Dificultad</span>
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Tipo</span>
          <select className={inputClass} value={itemType} onChange={(e) => setItemType(e.target.value as ItemType)}>
            <option value="base">base</option>
            <option value="mixed">mixed</option>
            <option value="modulator">modulator</option>
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Notas</span>
          <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
      <p className="callout-sage px-3 py-2 text-sm text-foreground">
        Vista previa: <strong>{previewRations}</strong> ración
        {previewRations === 1 ? "" : "es"} (10 g CHO = 1 ración)
      </p>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-terracotta rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear alimento"}
        </button>
        <SaveFeedback message={message} ok={ok} />
      </div>
    </form>
  );
}
