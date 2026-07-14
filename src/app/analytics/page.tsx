import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LevelProgressCard } from "@/components/ui/LevelProgressCard";
import {
  aggregateAnalyticsDashboard,
  enrichDashboardWithProgress,
} from "@/lib/domain/analytics-dashboard";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import { getLevels } from "@/lib/domain/exercises";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserLearningEvents } from "@/lib/supabase/analytics-events";
import { resolveProgress } from "@/lib/learning-state";

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
  const progress = await resolveProgress();
  const lessonIdsByLevel = Object.fromEntries(
    levels.map((level) => [
      level.id,
      getLessonsForLevel(level.id).map((lesson) => lesson.id),
    ]),
  );
  const dashboard = enrichDashboardWithProgress(
    aggregateAnalyticsDashboard(events, levelMeta),
    progress,
    lessonIdsByLevel,
  );

  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Mi actividad"
          description={`Historial de hitos del curso para ${user.displayName ?? user.email}.`}
        />

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
              <LevelProgressCard
                key={level.levelId}
                title={meta?.name ?? level.levelId}
                percent={level.progressPercent}
                subtitle={`${level.lessonsCompleted}/${level.totalLessons} lecciones${
                  level.examPassed && level.bestMasteryScore !== null
                    ? ` · Examen ${level.bestMasteryScore}%`
                    : ""
                }`}
              />
            );
          })}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Hitos recientes</h2>
          {dashboard.timeline.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Aún no hay hitos registrados con tu cuenta. El embudo refleja tu
              progreso actual del curso. Completa lecciones en{" "}
              <Link href="/learn" className="font-semibold text-emerald-700">
                el curso guiado
              </Link>{" "}
              para generar eventos.
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
