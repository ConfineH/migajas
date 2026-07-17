import { notFound, redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminShell } from "@/app/admin/AdminShell";
import { LessonStepsEditor } from "@/app/admin/lessons/[id]/LessonStepsEditor";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { getLessonById } from "@/lib/domain/lessons";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const lesson = getLessonById(id);
  return {
    title: lesson
      ? `Admin pasos — ${lesson.title}`
      : "Lección no encontrada — Migajas",
  };
}

export default async function AdminLessonStepsPage({ params }: PageProps) {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <AdminShell
            title={lesson.title}
            description={`${lesson.id} · ${lesson.steps.length} pasos editables`}
            backHref="/admin/lessons"
            backLabel="← Volver a lecciones"
          >
            <LessonStepsEditor lesson={lesson} />
          </AdminShell>
        </AppPageLayout>
      </main>
    </>
  );
}
