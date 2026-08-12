import { PASS_THRESHOLD } from "@/lib/domain/progress";

const COURSE_STEPS = [
  {
    title: "Lección",
    description: "Conceptos claros con comida real de tu región.",
  },
  {
    title: "Práctica",
    description: "Ejercicios cortos para afianzar lo aprendido.",
  },
  {
    title: "Fichas",
    description: "Repasa porciones y carbohidratos del nivel.",
  },
  {
    title: "Examen",
    description: `Aprueba con al menos ${PASS_THRESHOLD}% para desbloquear el siguiente.`,
  },
] as const;

export function CoursePathPreview() {
  return (
    <ol className="space-y-3 text-left">
      {COURSE_STEPS.map((item, index) => (
        <li
          key={item.title}
          className="flex items-start gap-4 rounded-2xl bg-sage-light/80 px-4 py-4"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-sage-strong shadow-soft"
            aria-hidden
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
