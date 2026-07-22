import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-pretty">
          Herramienta educativa. No sustituye el consejo de tu equipo de salud.
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link
                href="/privacidad"
                className="text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
              >
                Privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/cookies"
                className="text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
              >
                Cookies
              </Link>
            </li>
            <li>
              <Link
                href="/terminos"
                className="text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
              >
                Términos
              </Link>
            </li>
            <li>
              <Link
                href="/onboarding"
                className="text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
              >
                Configuración
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
