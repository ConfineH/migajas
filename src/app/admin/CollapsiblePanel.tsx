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
    <section className="feature-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        className="flex w-full items-start justify-between gap-3 p-5 text-left"
      >
        <div>
          <h2 className="font-medium text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-medium text-sage-strong">
          {open ? "Ocultar" : "Editar"}
        </span>
      </button>
      {open ? (
        <div id={`panel-${id}`} className="border-t border-border px-5 pb-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
