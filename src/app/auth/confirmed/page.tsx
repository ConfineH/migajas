import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { sanitizePostAuthRedirect } from "@/lib/domain/auth";

interface ConfirmedPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AuthConfirmedPage({
  searchParams,
}: ConfirmedPageProps) {
  const params = await searchParams;
  const nextPath = sanitizePostAuthRedirect(params.next, "/learn");

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="narrow" className="flex flex-col items-center py-12">
          <section className="hero-pill w-full max-w-md px-8 py-10 text-center sm:px-10 sm:py-12">
            <div className="space-y-3">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-light text-2xl text-sage-strong"
                aria-hidden
              >
                ✓
              </div>
              <h1 className="font-display text-2xl font-medium text-foreground">
                Cuenta confirmada
              </h1>
              <p className="text-muted">
                Tu correo ya está verificado. Ya puedes seguir con el curso y tu
                progreso quedará guardado en esta cuenta.
              </p>
            </div>

            <Button href={nextPath} className="mt-8 w-full">
              Continuar al curso
            </Button>
          </section>
        </AppPageLayout>
      </main>
    </>
  );
}
