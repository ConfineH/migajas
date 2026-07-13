import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { aggregateAnalyticsDashboard } from "@/lib/domain/analytics-dashboard";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { getLevels } from "@/lib/domain/exercises";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserLearningEvents } from "@/lib/supabase/analytics-events";

export const metadata = {
  title: "Mi actividad — Migajas",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function AnalyticsPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <>
        <AppNavBar />
        <main className="mx-auto max-w-lg flex-1 px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi actividad</h1>
          <p className="mt-3 text-gray-600">
            Inicia sesión para ver tu historial de lecciones, exámenes y hitos
            del curso.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button href="/login?next=/analytics" className="w-full">
              Iniciar sesión con Google
            </Button>
            <Button href="/progress" variant="secondary" className="w-full">
              Ver progreso sin cuenta
            </Button>
          </div>
        </main>
      </>
    );
  }

  const levels = getLevels();
  const levelMeta = levels.map((level) => ({
    id: level.id,
    lessonCount: getLessonsForLevel(level.id).length,
  }));

  const events = await getUserLearningEvents(user.id);
  const dashboard = aggregateAnalyticsDashboard(events, levelMeta);

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi actividad</h1>
          <p className="mt-2 text-gray-600">
            Historial de hitos del curso para {user.displayName ?? user.email}.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Lecciones" value={dashboard.lessonsCompleted} />
          <StatCard label="Exámenes" value={dashboard.examsPassed} />
          <StatCard
            label="Modo libre"
            value={dashboard.freeModeUnlocked ? "Sí" : "No"}
          />
          <StatCard label="Eventos" value={dashboard.totalEvents} />
        </div>

        <section className="mb-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Embudo por nivel</h2>
          {dashboard.levelFunnel.map((level) => {
            const meta = levels.find((l) => l.id === level.levelId);
            return (
              <div
                key={level.levelId}
                className="rounded-xl border border-emerald-100 bg-white p-4"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {meta?.name ?? level.levelId}
                  </span>
                  <span className="text-emerald-600">
                    {level.progressPercent}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${level.progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {level.lessonsCompleted}/{level.totalLessons} lecciones
                  {level.examPassed && level.bestMasteryScore !== null
                    ? ` · Examen ${level.bestMasteryScore}%`
                    : ""}
                </p>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Hitos recientes</h2>
          {dashboard.timeline.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Aún no hay eventos guardados. Completa lecciones del{" "}
              <Link href="/learn" className="font-semibold text-emerald-700">
                curso guiado
              </Link>{" "}
              con tu cuenta iniciada.
            </p>
          ) : (
            <ul className="space-y-2">
              {dashboard.timeline.map((entry) => (
                <li
                  key={`${entry.eventType}-${entry.createdAt}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm"
                >
                  <span className="text-gray-800">{entry.label}</span>
                  <time
                    className="shrink-0 text-xs text-gray-400"
                    dateTime={entry.createdAt}
                  >
                    {formatDate(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8 text-center">
          <Button href="/progress" variant="secondary">
            Ver progreso detallado
          </Button>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-emerald-700">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
