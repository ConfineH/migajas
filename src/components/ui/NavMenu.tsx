"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

interface NavMenuItem {
  href: string;
  label: string;
}

interface NavMenuProps {
  label: string;
  items: NavMenuItem[];
}

export function NavMenu({ label, items }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const active = items.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-emerald-50 ${
          active ? "bg-emerald-50 font-semibold text-emerald-800" : "text-emerald-700"
        }`}
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-40 rounded-xl border border-emerald-100 bg-white py-1 shadow-lg"
        >
          {items.map((item) => {
            const itemActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 text-sm hover:bg-emerald-50 ${
                    itemActive
                      ? "font-semibold text-emerald-800"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
