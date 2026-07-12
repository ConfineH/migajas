import Link from "next/link";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secondary:
    "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
  ghost: "text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
};

export function Button({
  href,
  onClick,
  variant = "primary",
  children,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
