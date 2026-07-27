import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminShell } from "@/app/admin/AdminShell";
import { LicenseeList } from "@/app/admin/licensees/LicenseeList";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";
import { listLicensees } from "@/lib/supabase/licensees-admin";
import { isServiceRoleConfigured } from "@/lib/supabase/service";

export const metadata = {
  title: "Admin licenciatarios — Migajas",
};

export default async function AdminLicenseesPage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  const licensees = isServiceRoleConfigured() ? await listLicensees() : [];

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <AdminNav currentPath="/admin/licensees" />
          <AdminShell
            title="Licenciatarios"
            description="Registro comercial B2B por territorio y nivel de soporte."
          >
            {!isServiceRoleConfigured() ? (
              <p className="rounded-2xl bg-terracotta-soft/30 px-4 py-3 text-sm text-foreground">
                Configura SUPABASE_SERVICE_ROLE_KEY para gestionar licenciatarios.
              </p>
            ) : (
              <LicenseeList licensees={licensees} />
            )}
          </AdminShell>
        </AppPageLayout>
      </main>
    </>
  );
}
