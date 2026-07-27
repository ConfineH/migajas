import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminShell } from "@/app/admin/AdminShell";
import { ExerciseList } from "@/app/admin/exercises/ExerciseList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { getAllExercises } from "@/lib/domain/exercises";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin ejercicios — Migajas",
};

export default async function AdminExercisesPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const exercises = getAllExercises();

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <AdminNav currentPath="/admin/exercises" />
          <AdminShell
            title="Ejercicios"
            description={`${exercises.length} ejercicios de referencia (solo lectura)`}
          >
            <ExerciseList exercises={exercises} />
          </AdminShell>
        </AppPageLayout>
      </main>
    </>
  );
}
