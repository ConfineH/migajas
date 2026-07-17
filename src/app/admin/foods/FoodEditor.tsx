"use client";

import { useState } from "react";
import type { FoodItem } from "@/lib/domain/foods";
import { calculateRations } from "@/lib/domain/rations";
import { saveFoodAction } from "@/app/admin/actions";
import { SaveFeedback } from "@/app/admin/SaveFeedback";

interface FoodEditorProps {
  food: FoodItem;
}

const inputClass = "field-input mt-1 text-sm";

export function FoodEditor({ food }: FoodEditorProps) {
  const [name, setName] = useState(food.name);
  const [category, setCategory] = useState(food.category);
  const [portionText, setPortionText] = useState(food.portionText);
  const [grams, setGrams] = useState(String(food.grams));
  const [carbsG, setCarbsG] = useState(String(food.carbsG));
  const [difficulty, setDifficulty] = useState(food.difficulty);
  const [itemType, setItemType] = useState(food.itemType);
  const [notes, setNotes] = useState(food.notes);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  const previewRations = calculateRations(Number(carbsG) || 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await saveFoodAction({
      id: food.id,
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
    setMessage(result.ok ? "Guardado" : result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted">{food.id}</p>
      <div className="grid gap-3 sm:grid-cols-2">
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
          <select className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value as FoodItem["difficulty"])}>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Tipo</span>
          <select className={inputClass} value={itemType} onChange={(e) => setItemType(e.target.value as FoodItem["itemType"])}>
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
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <SaveFeedback message={message} ok={ok} />
      </div>
    </form>
  );
}
