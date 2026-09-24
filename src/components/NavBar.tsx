import Link from "next/link";
import { MigajasLogo } from "@/components/brand/MigajasLogo";
import { formatUserDisplayName, type AuthUserSummary } from "@/lib/domain/auth";
import { signOut } from "@/app/login/actions";
import { buildAppNavLinks } from "@/lib/domain/app-nav";
import { NavLink } from "@/components/ui/NavLink";
import { NavMenu } from "@/components/ui/NavMenu";

interface NavBarProps {
  freeMode?: boolean;
  user?: AuthUserSummary | null;
  showAdmin?: boolean;
  showGuide?: boolean;
  showDiary?: boolean;
  showProfessional?: boolean;
  courseStarted?: boolean;
}

export function NavBar({
  freeMode = false,
  user = null,
  showAdmin = false,
  showGuide = false,
  showDiary = false,
  showProfessional = false,
  courseStarted = false,
}: NavBarProps) {
  const { primary: primaryLinks, more: moreLinks, mobilePinned } =
    buildAppNavLinks({
      isLoggedIn: Boolean(user),
      courseStarted,
      showDiary,
      showGuide,
      freeMode,
      showAdmin,
      showProfessional,
    });

  const mobileMoreItems = [
    ...primaryLinks.filter(
      (link) => !mobilePinned.some((pinned) => pinned.href === link.href),
    ),
    ...moreLinks,
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
            {mobilePinned.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
            <li>
              <NavMenu label="Más" items={mobileMoreItems} />
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
