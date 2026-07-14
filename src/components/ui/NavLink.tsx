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
      className={`inline-flex items-center rounded-lg px-2 py-1.5 hover:bg-emerald-50 ${
        active ? "bg-emerald-50 font-semibold text-emerald-800" : ""
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
