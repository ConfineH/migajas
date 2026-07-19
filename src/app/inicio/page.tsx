import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LearnAnimatedSection } from "@/components/learn/LearnAnimated";
import { LevelProgressCard } from "@/components/ui/LevelProgressCard";
import { canShowDiaryLink } from "@/lib/clinical-access";
import { localizeLevel } from "@/lib/domain/content-localization";
import { getLevels } from "@/lib/domain/exercises";
import {
  getHubProgressSummary,
  resolveHubCourseFocus,
} from "@/lib/domain/hub-dashboard";
import { getLessonsForLevel } from "@/lib/domain/lessons";
import {
  isFreeModeUnlocked,
  toGuidedProgress,
} from "@/lib/domain/guided-flow";
import { getFreeModeStatus } from "@/lib/free-mode";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { resolveProgress } from "@/lib/learning-state";
import { getActiveRegion } from "@/lib/region-server";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Inicio — Migajas",
};

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/inicio");
  }

  const [stored, region, freeMode, showDiary, showGuide] = await Promise.all([
    resolveProgress(),
    getActiveRegion(),
    getFreeModeStatus(),
    canShowDiaryLink(),
    hasCompletedOnboarding(),
  ]);

  const progress = toGuidedProgress(stored);
  const levels = getLevels().map((level) => localizeLevel(level, region));
  const focus = resolveHubCourseFocus(progress, levels);
  const summary = getHubProgressSummary(
    progress,
    levels,
    focus?.levelId,
  );
  const totalLessons = levels.reduce(
    (count, level) => count + getLessonsForLevel(level.id).length,
    0,
  );
  const greetingName =
    user.displayName?.trim() ||
    (user.email ? (user.email.split("@")[0] ?? null) : null);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <LearnAnimatedSection className="space-y-8">
            <header className="space-y-2">
              <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
                ¡Hola{greetingName ? `, ${greetingName}` : ""}!
              </h1>
              <p className="text-pretty text-muted">
                ¿Qué te gustaría hacer hoy?
              </p>
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <section className="feature-card space-y-5 p-6 sm:p-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium uppercase tracking-wide text-sage-strong">
                    Curso guiado
                  </p>
                  <h2 className="font-display text-2xl font-medium text-foreground">
                    {focus?.levelName ?? "Tu curso"}
                  </h2>
                  <p className="text-sm text-muted">
                    {levels.length} niveles · {totalLessons} lecciones
                  </p>
                </div>

                {focus?.nextItem ? (
                  <div className="rounded-2xl bg-sage-light/70 px-5 py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-sage-strong">
                      Sigue aprendiendo
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {focus.nextLabel}
                    </p>
                  </div>
                ) : (
                  <p className="rounded-2xl bg-sage-light/70 px-5 py-4 text-sm text-muted">
                    Has completado todos los pasos desbloqueados. Puedes repasar
                    cuando quieras.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  {focus ? (
                    <Button href={focus.continueHref}>
                      {focus.nextItem
                        ? "Continuar aprendiendo"
                        : "Ir al nivel"}
                    </Button>
                  ) : null}
                  <Button href="/learn" variant="secondary">
                    Ver todos los niveles
                  </Button>
                </div>
              </section>

              <aside className="space-y-4">
                <LevelProgressCard
                  title="Tu progreso"
                  percent={summary.activePercent}
                  subtitle={`${summary.passedLevels}/${summary.totalLevels} niveles aprobados${
                    summary.activeLevelName
                      ? ` · ${summary.activeLevelName}`
                      : ""
                  }`}
                />
                <Link
                  href="/progress"
                  className="inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
                >
                  Ver progreso detallado →
                </Link>
              </aside>
            </div>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-medium text-foreground">
                Accesos rápidos
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <Link href="/learn" className="card-interactive block p-4">
                    <p className="font-medium text-foreground">Curso</p>
                    <p className="mt-1 text-sm text-muted">
                      Ruta guiada por niveles
                    </p>
                  </Link>
                </li>
                <li>
                  <Link href="/progress" className="card-interactive block p-4">
                    <p className="font-medium text-foreground">Progreso</p>
                    <p className="mt-1 text-sm text-muted">
                      Aciertos, niveles y repaso
                    </p>
                  </Link>
                </li>
                {showDiary ? (
                  <li>
                    <Link href="/diario" className="card-interactive block p-4">
                      <p className="font-medium text-foreground">Diario</p>
                      <p className="mt-1 text-sm text-muted">
                        Registra tu ingesta diaria
                      </p>
                    </Link>
                  </li>
                ) : null}
                {showGuide ? (
                  <li>
                    <Link href="/guia" className="card-interactive block p-4">
                      <p className="font-medium text-foreground">Guía</p>
                      <p className="mt-1 text-sm text-muted">
                        Consulta rápida de referencia
                      </p>
                    </Link>
                  </li>
                ) : null}
                {freeMode || isFreeModeUnlocked(progress) ? (
                  <>
                    <li>
                      <Link
                        href="/levels"
                        className="card-interactive block p-4"
                      >
                        <p className="font-medium text-foreground">Practicar</p>
                        <p className="mt-1 text-sm text-muted">
                          Ejercicios libres por nivel
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/catalog"
                        className="card-interactive block p-4"
                      >
                        <p className="font-medium text-foreground">Catálogo</p>
                        <p className="mt-1 text-sm text-muted">
                          Busca alimentos y porciones
                        </p>
                      </Link>
                    </li>
                  </>
                ) : null}
              </ul>
            </section>
          </LearnAnimatedSection>
        </AppPageLayout>
      </main>
    </>
  );
}
