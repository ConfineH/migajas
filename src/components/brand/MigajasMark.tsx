interface MigajasMarkProps {
  className?: string;
}

/** Isotipo de migajas — formas orgánicas sobre fondo transparente. */
export function MigajasMark({ className = "h-10 w-16" }: MigajasMarkProps) {
  return (
    <svg
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse
        cx="40"
        cy="34"
        rx="30"
        ry="23"
        fill="var(--sage-strong)"
        transform="rotate(-14 40 34)"
      />
      <ellipse
        cx="74"
        cy="30"
        rx="26"
        ry="20"
        fill="var(--sage)"
        transform="rotate(16 74 30)"
      />
      <circle cx="56" cy="50" r="9" fill="var(--terracotta-soft)" />
      <circle cx="90" cy="54" r="5.5" fill="var(--terracotta-soft)" />
    </svg>
  );
}
