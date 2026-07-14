import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
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
      <main className="mx-auto flex max-w-lg flex-1 flex-col px-4 py-12">
        <section className="space-y-8 text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cuenta confirmada
            </h1>
            <p className="text-gray-600">
              Tu correo ya está verificado. Ya puedes seguir con el curso y tu
              progreso quedará guardado en esta cuenta.
            </p>
          </div>

          <Button href={nextPath} className="w-full">
            Continuar al curso
          </Button>
        </section>
      </main>
    </>
  );
}
