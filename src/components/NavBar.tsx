import Link from "next/link";
import { formatUserDisplayName, type AuthUserSummary } from "@/lib/domain/auth";
import { signOut } from "@/app/login/actions";

interface NavBarProps {
  freeMode?: boolean;
  user?: AuthUserSummary | null;
}

export function NavBar({ freeMode = false, user = null }: NavBarProps) {
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/learn", label: "Curso" },
    ...(freeMode
      ? [
          { href: "/levels", label: "Practicar" },
          { href: "/catalog", label: "Catálogo" },
        ]
      : []),
    { href: "/progress", label: "Progreso" },
    { href: "/analytics", label: "Actividad" },
    { href: "/onboarding", label: "Configuración" },
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

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <ul className="flex min-w-0 items-center gap-0.5 overflow-x-auto whitespace-nowrap text-sm font-medium text-emerald-700 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {links.map((link) => (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    className="inline-flex items-center rounded-lg px-2 py-1.5 hover:bg-emerald-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
