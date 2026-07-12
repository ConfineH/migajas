import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <>
      <AppNavBar />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col px-4 py-12">
        <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Aprende contando carbohidratos
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Migajas
            </h1>
            <p className="mx-auto max-w-md text-lg text-gray-600">
              Un curso breve guiado para aprender a relacionar gramos,
              carbohidratos y raciones con comida real de España.
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/onboarding" className="w-full sm:w-auto">
              Empezar curso
            </Button>
            <Button href="/learn" variant="secondary" className="w-full sm:w-auto">
              Continuar
            </Button>
          </div>

          <div className="mt-8 rounded-2xl bg-emerald-50 px-6 py-4 text-sm text-emerald-800">
            <strong>España</strong> · 10 g de carbohidratos = 1 ración
          </div>
        </section>

        <section className="mt-16 space-y-6 border-t border-gray-100 pt-12">
          <h2 className="text-xl font-bold text-gray-900">¿Cómo funciona?</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Lecciones cortas",
                desc: "Conceptos claros con ejemplos de alimentos reales.",
              },
              {
                step: "2",
                title: "Práctica y examen",
                desc: "Ejercicios entre lecciones y examen al final del nivel.",
              },
              {
                step: "3",
                title: "Modo libre",
                desc: "Tras aprobar, desbloqueas catálogo y práctica libre.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-gray-100 p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-3 font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
