"use client";

import { useState } from "react";

interface CollapsiblePanelProps {
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsiblePanel({
  id,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        className="flex w-full items-start justify-between gap-3 p-5 text-left"
      >
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm text-emerald-600">
          {open ? "Ocultar" : "Editar"}
        </span>
      </button>
      {open ? (
        <div id={`panel-${id}`} className="border-t border-emerald-50 px-5 pb-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
