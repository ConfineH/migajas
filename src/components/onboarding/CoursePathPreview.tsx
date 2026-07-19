const COURSE_STEPS = [
  {
    icon: "📖",
    title: "Lección",
    description: "Conceptos claros con comida real de tu región.",
  },
  {
    icon: "✏️",
    title: "Práctica",
    description: "Ejercicios cortos para afianzar lo aprendido.",
  },
  {
    icon: "🃏",
    title: "Fichas",
    description: "Repasa porciones y carbohidratos del nivel.",
  },
  {
    icon: "🎯",
    title: "Examen",
    description: "Aprueba con al menos 60% para desbloquear el siguiente.",
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-xl shadow-soft"
            aria-hidden
          >
            {item.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              <span className="mr-2 text-sm text-sage-strong">{index + 1}.</span>
              {item.title}
            </p>
            <p className="mt-1 text-pretty text-sm text-muted">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
