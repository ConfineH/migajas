import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/levels", label: "Practicar" },
  { href: "/progress", label: "Progreso" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/onboarding", label: "Configuración" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-emerald-800"
        >
          Migajas
        </Link>
        <ul className="flex gap-4 text-sm font-medium text-emerald-700">
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
      </nav>
    </header>
  );
}
