import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AdminComplianceMetrics } from "@/app/admin/AdminComplianceMetrics";
import { AdminNav } from "@/app/admin/AdminNav";
import { AdminShell } from "@/app/admin/AdminShell";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { isContentAdmin } from "@/lib/domain/admin";
import { getAuthUser } from "@/lib/supabase/auth";

export const metadata = {
  title: "Admin cumplimiento — Migajas",
};

export default async function AdminCompliancePage() {
  const user = await getAuthUser();
  if (!isContentAdmin(user?.email)) redirect("/");

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout>
          <AdminNav currentPath="/admin/compliance" />
          <AdminShell
            title="Cumplimiento"
            description="Consentimientos agregados por tipo y versión legal."
          >
            <AdminComplianceMetrics />
          </AdminShell>
        </AppPageLayout>
      </main>
    </>
  );
}
