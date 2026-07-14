import Link from "next/link";
import { formatUserDisplayName, type AuthUserSummary } from "@/lib/domain/auth";
import { signOut } from "@/app/login/actions";
import { NavLink } from "@/components/ui/NavLink";
import { NavMenu } from "@/components/ui/NavMenu";

interface NavBarProps {
  freeMode?: boolean;
  user?: AuthUserSummary | null;
  showAdmin?: boolean;
  showGuide?: boolean;
  showDiary?: boolean;
}

export function NavBar({
  freeMode = false,
  user = null,
  showAdmin = false,
  showGuide = false,
  showDiary = false,
}: NavBarProps) {
  const primaryLinks = [
    { href: "/learn", label: "Curso" },
    ...(showDiary ? [{ href: "/diario", label: "Diario" }] : []),
    ...(freeMode
      ? [
          { href: "/levels", label: "Practicar" },
          { href: "/catalog", label: "Catálogo" },
        ]
      : []),
    { href: "/progress", label: "Progreso" },
  ];

  const moreLinks = [
    ...(showGuide ? [{ href: "/guia", label: "Guía" }] : []),
    { href: "/analytics", label: "Actividad" },
    { href: "/onboarding", label: "Configuración" },
    ...(showAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-emerald-800"
          >
            Migajas
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            <ul className="flex min-w-0 items-center gap-0.5 text-sm font-medium text-emerald-700">
              {primaryLinks.map((link) => (
                <li key={link.href} className="shrink-0">
                  <NavLink href={link.href}>{link.label}</NavLink>
                </li>
              ))}
              <li className="shrink-0">
                <NavMenu label="Más" items={moreLinks} />
              </li>
            </ul>

            <div className="shrink-0 border-l border-emerald-100 pl-2 sm:pl-3">
              {user ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="hidden max-w-24 truncate text-gray-600 sm:inline md:max-w-none">
                    {formatUserDisplayName(user)}
                  </span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg px-2 py-1.5 font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
