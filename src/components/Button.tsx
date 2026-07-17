import Link from "next/link";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants = {
  primary:
    "btn-terracotta hover:brightness-[1.02] active:scale-[0.98] focus-visible:ring-terracotta",
  secondary:
    "border border-sage-strong/30 bg-surface text-foreground hover:border-sage-strong/50 hover:bg-sage-light/50 active:scale-[0.98] focus-visible:ring-sage-strong",
  ghost:
    "text-sage-strong hover:bg-sage-light/60 active:scale-[0.98] focus-visible:ring-sage-strong",
};

export function Button({
  href,
  onClick,
  variant = "primary",
  children,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
