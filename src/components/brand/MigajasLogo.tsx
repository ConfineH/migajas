import { MigajasMark } from "@/components/brand/MigajasMark";

const MARK_SIZES = {
  sm: "h-7 w-11",
  md: "h-9 w-14",
  lg: "h-12 w-20",
} as const;

const WORD_SIZES = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

interface MigajasLogoProps {
  /** Solo isotipo, o isotipo + wordmark */
  variant?: "mark" | "full";
  size?: keyof typeof MARK_SIZES;
  className?: string;
  /** En pantallas con título propio (login), omitir el wordmark */
  showWordmark?: boolean;
}

export function MigajasLogo({
  variant = "full",
  size = "md",
  className = "",
  showWordmark = true,
}: MigajasLogoProps) {
  const mark = (
    <MigajasMark className={MARK_SIZES[size]} />
  );

  if (variant === "mark") {
    return (
      <span className={`inline-flex shrink-0 ${className}`}>{mark}</span>
    );
  }

  return (
    <span
      className={`inline-flex flex-col items-center gap-2 ${className}`}
    >
      {mark}
      {showWordmark ? (
        <span
          className={`font-display font-medium lowercase leading-none tracking-tight text-sage-strong ${WORD_SIZES[size]}`}
        >
          migajas
        </span>
      ) : null}
    </span>
  );
}
