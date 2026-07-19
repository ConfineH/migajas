import Link from "next/link";
import { MigajasLogo } from "@/components/brand/MigajasLogo";
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
    ...(user ? [{ href: "/inicio", label: "Inicio" }] : []),
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
    <header className="relative z-10 bg-background/80 backdrop-blur-sm">
      <nav
        className="mx-auto grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-5 sm:px-8"
        aria-label="Principal"
      >
        <Link
          href={user ? "/inicio" : "/"}
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-strong focus-visible:ring-offset-2"
        >
          <MigajasLogo variant="mark" size="sm" />
          <span className="font-display text-2xl font-semibold text-foreground">
            Migajas
          </span>
        </Link>

        <ul className="hidden items-center justify-center gap-1 text-sm font-medium text-foreground/85 md:flex">
          {primaryLinks.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href}>{link.label}</NavLink>
            </li>
          ))}
          <li>
            <NavMenu label="Más" items={moreLinks} />
          </li>
        </ul>

        <div className="flex items-center justify-end gap-3 text-sm">
          <ul className="flex items-center gap-0.5 md:hidden">
            <li>
              <NavLink href={user ? "/inicio" : "/learn"}>
                {user ? "Inicio" : "Curso"}
              </NavLink>
            </li>
            <li>
              <NavMenu label="Más" items={[...primaryLinks.slice(1), ...moreLinks]} />
            </li>
          </ul>
          {user ? (
            <>
              <span className="hidden truncate text-muted sm:inline max-w-[8rem] lg:max-w-none">
                {formatUserDisplayName(user)}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
