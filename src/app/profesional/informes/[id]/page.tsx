import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAuthUser } from "@/lib/supabase/auth";
import { getShareForProfessional } from "@/lib/supabase/professional";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { NOINDEX_METADATA } from "@/lib/domain/seo";

export const metadata = NOINDEX_METADATA;
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfessionalSharePage({ params }: Props) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    redirect(`/login?next=/profesional/informes/${id}`);
  }

  const profile = await getUserProfile(user.id);
  if (!profile?.is_professional) {
    redirect("/profesional/alta");
  }

  const share = await getShareForProfessional(user.id, id);
  if (!share) notFound();

  const report = share.snapshot;

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <p className="mb-4">
            <Link
              href="/profesional"
              className="text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              ← Volver al perfil
            </Link>
          </p>
          <PageHeader
            title={`Informe del ${share.range_from} al ${share.range_to}`}
            description="Resumen educativo que la persona te envió. No sustituye la historia clínica."
          />

          <dl className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="feature-card p-5">
              <dt className="text-sm text-muted">Carbohidratos en el periodo</dt>
              <dd className="mt-1 font-display text-2xl text-foreground">
                {report.days.reduce((sum, day) => sum + day.totalCarbsG, 0)} g
              </dd>
            </div>
            <div className="feature-card p-5">
              <dt className="text-sm text-muted">Días con registro</dt>
              <dd className="mt-1 font-display text-2xl text-foreground">
                {report.days.filter((day) => day.totalCarbsG > 0).length}
              </dd>
            </div>
          </dl>

          <h2 className="font-display text-xl font-medium text-foreground">
            Por día
          </h2>
          <ul className="mt-4 space-y-2">
            {report.days.map((day) => (
              <li
                key={day.date}
                className="flex items-center justify-between rounded-xl bg-sage-light/50 px-4 py-3 text-sm"
              >
                <span>{day.date}</span>
                <span>
                  {day.totalCarbsG} g · {day.totalRations} raciones
                </span>
              </li>
            ))}
          </ul>
        </AppPageLayout>
      </main>
    </>
  );
}
