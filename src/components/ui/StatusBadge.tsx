interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "locked" | "success" | "muted" | "warning";
}

const variants = {
  locked: "bg-sage-muted/50 text-muted",
  success: "bg-sage-strong text-white",
  muted: "bg-sage-light text-sage-strong",
  warning: "bg-terracotta-soft/60 text-terracotta-dark",
};

export function StatusBadge({
  children,
  variant = "locked",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center self-start rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
