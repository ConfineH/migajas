import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ProfessionalActivateForm } from "@/components/professional/ProfessionalActivateForm";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PROFESSIONAL_PAGE } from "@/lib/domain/professional-cycle";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { NOINDEX_METADATA } from "@/lib/domain/seo";

export const metadata = NOINDEX_METADATA;

export default async function ProfessionalSignUpPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/profesional/alta");
  }

  const profile = await getUserProfile(user.id);
  if (profile?.is_professional) {
    redirect("/profesional");
  }

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <PageHeader
            title="Perfil profesional"
            description={PROFESSIONAL_PAGE.audienceLead}
          />
          <ProfessionalActivateForm />
        </AppPageLayout>
      </main>
    </>
  );
}
