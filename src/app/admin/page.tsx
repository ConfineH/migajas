import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminOrgMetrics } from "@/app/admin/AdminOrgMetrics";
import { AdminStatusBanner } from "@/app/admin/AdminStatusBanner";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getContentCache } from "@/lib/content-cache";
import { getAllExercises } from "@/lib/domain/exercises";
import { getAllLessons, getAllExams } from "@/lib/domain/lessons";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin — Migajas",
};

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const { foods, source } = getContentCache();
  const lessons = getAllLessons();
  const exams = getAllExams();
  const exercises = getAllExercises();

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Panel de administración"
            description="Métricas de adopción, contenido editable y operaciones comerciales."
          />
          <AdminNav currentPath="/admin" />
          <AdminStatusBanner />

          <div className="mb-8">
            <AdminOrgMetrics />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/foods" className="card-interactive p-6">
              <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
                {foods.length}
              </p>
              <h2 className="mt-2 font-medium text-foreground">Alimentos</h2>
              <p className="mt-1 text-sm text-muted">
                Porción, gramos y carbohidratos.
              </p>
            </Link>
            <Link href="/admin/lessons" className="card-interactive p-6">
              <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
                {lessons.length}
              </p>
              <h2 className="mt-2 font-medium text-foreground">Lecciones</h2>
              <p className="mt-1 text-sm text-muted">
                Título, resumen y pasos.
              </p>
            </Link>
            <Link href="/admin/exams" className="card-interactive p-6">
              <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
                {exams.length}
              </p>
              <h2 className="mt-2 font-medium text-foreground">Exámenes</h2>
              <p className="mt-1 text-sm text-muted">
                Ejercicios por nivel.
              </p>
            </Link>
            <Link href="/admin/exercises" className="card-interactive p-6">
              <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
                {exercises.length}
              </p>
              <h2 className="mt-2 font-medium text-foreground">Ejercicios</h2>
              <p className="mt-1 text-sm text-muted">
                Banco de referencia (solo lectura).
              </p>
            </Link>
            <Link href="/admin/compliance" className="card-interactive p-6">
              <h2 className="font-medium text-foreground">Cumplimiento</h2>
              <p className="mt-1 text-sm text-muted">
                Consentimientos por tipo y versión legal.
              </p>
            </Link>
            <Link href="/admin/licensees" className="card-interactive p-6">
              <h2 className="font-medium text-foreground">Licenciatarios</h2>
              <p className="mt-1 text-sm text-muted">
                Contratos B2B por territorio.
              </p>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted">
            Fuente activa: {source === "supabase" ? "Supabase" : "JSON local"}
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
