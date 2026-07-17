import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminOrgMetrics } from "@/app/admin/AdminOrgMetrics";
import { AdminStatusBanner } from "@/app/admin/AdminStatusBanner";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getContentCache } from "@/lib/content-cache";
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

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Administración de contenido"
            description="Edita alimentos, lecciones y exámenes en Supabase."
          />
          <AdminStatusBanner />

          <div className="mb-8">
            <AdminOrgMetrics />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
          </div>

          <p className="mt-6 text-xs text-muted">
            Fuente activa: {source === "supabase" ? "Supabase" : "JSON local"}
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
