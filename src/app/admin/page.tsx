import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminShell } from "@/app/admin/AdminShell";
import { AdminStatusBanner } from "@/app/admin/AdminStatusBanner";
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
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
        <PageHeader
          title="Administración de contenido"
          description="Edita alimentos, lecciones y exámenes en Supabase."
        />
        <AdminStatusBanner />

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/foods"
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:border-emerald-200 hover:shadow-md"
          >
            <p className="text-2xl font-bold text-emerald-700">{foods.length}</p>
            <h2 className="mt-2 font-bold text-gray-900">Alimentos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Porción, gramos y carbohidratos.
            </p>
          </Link>
          <Link
            href="/admin/lessons"
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:border-emerald-200 hover:shadow-md"
          >
            <p className="text-2xl font-bold text-emerald-700">{lessons.length}</p>
            <h2 className="mt-2 font-bold text-gray-900">Lecciones</h2>
            <p className="mt-1 text-sm text-gray-600">
              Título, resumen y pasos.
            </p>
          </Link>
          <Link
            href="/admin/exams"
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:border-emerald-200 hover:shadow-md"
          >
            <p className="text-2xl font-bold text-emerald-700">{exams.length}</p>
            <h2 className="mt-2 font-bold text-gray-900">Exámenes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Ejercicios por nivel.
            </p>
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Fuente activa: {source === "supabase" ? "Supabase" : "JSON local"}
        </p>
      </main>
    </>
  );
}
