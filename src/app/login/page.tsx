import { AppNavBar } from "@/components/AppNavBar";
import { MigajasLogo } from "@/components/brand/MigajasLogo";
import { Button } from "@/components/Button";
import { EmailAuthForm } from "@/components/EmailAuthForm";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { sanitizePostAuthRedirect } from "@/lib/domain/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = sanitizePostAuthRedirect(params.next, "/learn");
  const configured = isSupabaseConfigured();

  const errorMessage =
    params.error === "config"
      ? "Falta configurar Supabase. Copia .env.example a .env.local y añade tus claves."
      : params.error === "auth"
        ? "No se pudo completar el inicio de sesión. Inténtalo de nuevo."
        : null;

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="narrow" className="flex flex-col items-center py-10 sm:py-14">
          <section className="hero-pill w-full max-w-md px-8 py-10 text-center sm:px-10 sm:py-12">
            <MigajasLogo variant="mark" size="lg" className="mx-auto mb-2" />
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-medium text-foreground">
                Tu cuenta
              </h1>
              <p className="text-pretty text-muted">
                Guarda tu progreso entre dispositivos con Google o con tu correo.
              </p>
            </div>

            {errorMessage ? (
              <p
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {errorMessage}
              </p>
            ) : null}

            {configured ? (
              <div className="mt-8 space-y-6 text-left">
                <GoogleSignInButton nextPath={nextPath} />
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted">o</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <EmailAuthForm nextPath={nextPath} />
              </div>
            ) : (
              <p className="mt-8 rounded-2xl bg-sage-light px-4 py-3 text-sm text-foreground">
                El inicio de sesión requiere configurar Supabase en{" "}
                <code className="text-xs">.env.local</code>.
              </p>
            )}

            <div className="mt-8 space-y-3 border-t border-border/60 pt-6">
              <p className="text-sm text-muted">¿Prefieres empezar sin cuenta?</p>
              <Button href="/onboarding" variant="secondary" className="w-full">
                Continuar como invitado
              </Button>
            </div>
          </section>
        </AppPageLayout>
      </main>
    </>
  );
}
