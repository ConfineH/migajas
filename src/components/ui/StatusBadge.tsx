interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: "locked" | "success" | "muted" | "warning";
}

const variants = {
  locked: "bg-gray-200 text-gray-500",
  success: "bg-emerald-600 text-white",
  muted: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
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
