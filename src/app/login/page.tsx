import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
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
      <main className="mx-auto flex max-w-lg flex-1 flex-col px-4 py-12">
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-600">
              Inicia sesión con Google para guardar tu progreso entre
              dispositivos.
            </p>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {errorMessage}
            </p>
          )}

          {configured ? (
            <GoogleSignInButton nextPath={nextPath} />
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              El inicio de sesión con Google requiere configurar Supabase en{" "}
              <code className="text-xs">.env.local</code>.
            </p>
          )}

          <div className="space-y-3 border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              ¿Prefieres empezar sin cuenta?
            </p>
            <Button href="/onboarding" variant="secondary" className="w-full">
              Continuar como invitado
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
