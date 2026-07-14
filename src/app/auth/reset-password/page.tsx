import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
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
      <main className="mx-auto flex max-w-lg flex-1 flex-col px-4 py-12">
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
            <p className="text-gray-600">
              Elige una contraseña nueva para tu cuenta.
            </p>
          </div>
          <ResetPasswordForm />
        </section>
      </main>
    </>
  );
}
