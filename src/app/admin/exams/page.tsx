import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminShell } from "@/app/admin/AdminShell";
import { ExamEditor } from "@/app/admin/exams/ExamEditor";
import { getAllExams } from "@/lib/domain/lessons";
import { getLevels } from "@/lib/domain/exercises";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin exámenes — Migajas",
};

export default async function AdminExamsPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const exams = getAllExams();
  const levelNames = Object.fromEntries(
    getLevels().map((level) => [level.id, level.name]),
  );

  return (
    <>
      <AppNavBar />
      <AdminShell
        title="Exámenes por nivel"
        description="Título, descripción y lista de ejercicios de cada examen."
      >
        <div className="space-y-4">
          {exams.map((exam) => (
            <ExamEditor
              key={exam.levelId}
              exam={exam}
              levelName={levelNames[exam.levelId] ?? exam.levelId}
            />
          ))}
        </div>
      </AdminShell>
    </>
  );
}
