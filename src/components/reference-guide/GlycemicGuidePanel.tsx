import {
  GLYCEMIC_IMPACT_HINTS_ES,
  GLYCEMIC_IMPACT_LABELS_ES,
} from "@/lib/domain/food-nutrition";
import type { Difficulty } from "@/lib/domain/foods";

const EXAMPLES: Array<{ difficulty: Difficulty; foods: string }> = [
  { difficulty: "Baja", foods: "lentejas, manzana, yogur natural" },
  { difficulty: "Media", foods: "pan integral, piña en almíbar, patatas fritas" },
  { difficulty: "Alta", foods: "zumo de naranja, pizza, tarta de cumpleaños" },
];

export function GlycemicGuidePanel() {
  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
      <h2 className="font-bold text-sky-950">Índice glucémico (orientativo)</h2>
      <p className="mt-2 text-sm text-sky-900">
        En Migajas usamos tres niveles de impacto glucémico en cada alimento.
        No sustituye el conteo de raciones: dos alimentos con el mismo impacto
        pueden tener HC distintos.
      </p>
      <ul className="mt-4 space-y-3">
        {EXAMPLES.map((item) => (
          <li
            key={item.difficulty}
            className="rounded-xl border border-sky-100 bg-white p-3 text-sm"
          >
            <p className="font-semibold text-gray-900">
              {GLYCEMIC_IMPACT_LABELS_ES[item.difficulty]}
            </p>
            <p className="mt-1 text-gray-600">
              {GLYCEMIC_IMPACT_HINTS_ES[item.difficulty]}
            </p>
            <p className="mt-2 text-gray-500">Ejemplos: {item.foods}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-sky-800">
        Las grasas y proteínas del plato pueden retrasar la subida de glucosa.
        Consulta la pestaña Fuentes para ADA y FEN.
      </p>
    </section>
  );
}
