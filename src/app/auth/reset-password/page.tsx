import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { getAuthUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=config");
  }

  const user = await getAuthUser();
  if (!user) {
    redirect("/login?error=auth");
  }

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="narrow" className="flex flex-col items-center py-12">
          <section className="hero-pill w-full max-w-md px-8 py-10 text-center sm:px-10 sm:py-12">
            <div className="space-y-3">
              <h1 className="font-display text-2xl font-medium text-foreground">
                Nueva contraseña
              </h1>
              <p className="text-muted">Elige una contraseña nueva para tu cuenta.</p>
            </div>
            <div className="mt-8 text-left">
              <ResetPasswordForm />
            </div>
          </section>
        </AppPageLayout>
      </main>
    </>
  );
}
