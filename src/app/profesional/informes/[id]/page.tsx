import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAuthUser } from "@/lib/supabase/auth";
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
            title="Informe no disponible"
            description="La lectura profesional de informes está suspendida. Esta página no carga el contenido. La copia no se ha borrado: quien la envió puede consultarla y retirarla desde su cuenta."
          />
        </AppPageLayout>
      </main>
    </>
  );
}
