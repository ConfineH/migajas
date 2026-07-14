import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminShell } from "@/app/admin/AdminShell";
import { LessonList } from "@/app/admin/lessons/LessonList";
import { getAllLessons } from "@/lib/domain/lessons";
import { getLevels } from "@/lib/domain/exercises";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin lecciones — Migajas",
};

export default async function AdminLessonsPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const lessons = getAllLessons();
  const levelNames = Object.fromEntries(
    getLevels().map((level) => [level.id, level.name]),
  );

  return (
    <>
      <AppNavBar />
      <AdminShell
        title="Lecciones"
        description="Metadatos y pasos del curso guiado."
      >
        <LessonList lessons={lessons} levelNames={levelNames} />
      </AdminShell>
    </>
  );
}
