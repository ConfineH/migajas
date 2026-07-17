"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3 py-1.5 transition-colors duration-200 ${
        active
          ? "font-semibold text-foreground"
          : "text-foreground/75 hover:text-foreground"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
