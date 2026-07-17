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
    <section className="callout-sage">
      <h2 className="font-display text-xl font-medium text-foreground">
        Índice glucémico (orientativo)
      </h2>
      <p className="mt-2 text-sm text-muted">
        En Migajas usamos tres niveles de impacto glucémico en cada alimento.
        No sustituye el conteo de raciones: dos alimentos con el mismo impacto
        pueden tener HC distintos.
      </p>
      <ul className="mt-4 space-y-3">
        {EXAMPLES.map((item) => (
          <li key={item.difficulty} className="feature-card p-3 text-sm">
            <p className="font-medium text-foreground">
              {GLYCEMIC_IMPACT_LABELS_ES[item.difficulty]}
            </p>
            <p className="mt-1 text-muted">
              {GLYCEMIC_IMPACT_HINTS_ES[item.difficulty]}
            </p>
            <p className="mt-2 text-muted/80">Ejemplos: {item.foods}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        Las grasas y proteínas del plato pueden retrasar la subida de glucosa.
        Consulta la pestaña Fuentes para ADA y FEN.
      </p>
    </section>
  );
}
