import Link from "next/link";

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/foods", label: "Alimentos" },
  { href: "/admin/lessons", label: "Lecciones" },
  { href: "/admin/exams", label: "Exámenes" },
  { href: "/admin/exercises", label: "Ejercicios" },
  { href: "/admin/compliance", label: "Cumplimiento" },
  { href: "/admin/licensees", label: "Licenciatarios" },
] as const;

interface AdminNavProps {
  currentPath: string;
}

export function AdminNav({ currentPath }: AdminNavProps) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? currentPath === "/admin"
            : currentPath.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sage-strong text-white"
                : "bg-sage-light text-foreground hover:bg-sage/30"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
