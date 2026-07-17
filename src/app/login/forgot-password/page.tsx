import { AppNavBar } from "@/components/AppNavBar";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="narrow" className="flex flex-col items-center py-12">
          <section className="hero-pill w-full max-w-md px-8 py-10 text-center sm:px-10 sm:py-12">
            <div className="space-y-3">
              <h1 className="font-display text-2xl font-medium text-foreground">
                Recuperar contraseña
              </h1>
              <p className="text-muted">
                Te enviaremos un enlace para elegir una contraseña nueva.
              </p>
            </div>

            {configured ? (
              <div className="mt-8 text-left">
                <ForgotPasswordForm />
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-terracotta-soft/25 px-4 py-3 text-sm text-foreground">
                El inicio de sesión requiere configurar Supabase en{" "}
                <code className="text-xs">.env.local</code>.
              </p>
            )}
          </section>
        </AppPageLayout>
      </main>
    </>
  );
}
