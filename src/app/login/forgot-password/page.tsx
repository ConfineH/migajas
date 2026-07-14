import { AppNavBar } from "@/components/AppNavBar";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const configured = isSupabaseConfigured();

  return (
    <>
      <AppNavBar />
      <main className="mx-auto flex max-w-lg flex-1 flex-col px-4 py-12">
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Recuperar contraseña
            </h1>
            <p className="text-gray-600">
              Te enviaremos un enlace para elegir una contraseña nueva.
            </p>
          </div>

          {configured ? (
            <ForgotPasswordForm />
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              El inicio de sesión requiere configurar Supabase en{" "}
              <code className="text-xs">.env.local</code>.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
