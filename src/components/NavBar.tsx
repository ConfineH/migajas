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
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-emerald-800"
        >
          Migajas
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <ul className="flex flex-wrap gap-2 text-sm font-medium text-emerald-700">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-2 py-1 hover:bg-emerald-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {user ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-gray-600 sm:inline">
                {formatUserDisplayName(user)}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Salir
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-2 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
