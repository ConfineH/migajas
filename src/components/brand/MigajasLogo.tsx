import Image from "next/image";

const FULL_SIZES = {
  sm: "h-14 w-44",
  md: "h-20 w-60",
  lg: "h-28 w-80",
} as const;

const MARK_SIZES = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
} as const;

interface MigajasLogoProps {
  variant?: "full" | "mark";
  size?: keyof typeof FULL_SIZES;
  className?: string;
  priority?: boolean;
}

export function MigajasLogo({
  variant = "full",
  size = "md",
  className = "",
  priority = false,
}: MigajasLogoProps) {
  if (variant === "mark") {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-black shadow-soft ${MARK_SIZES[size]} ${className}`}
      >
        <Image
          src="/logo.png"
          alt=""
          fill
          sizes="56px"
          priority={priority}
          className="object-cover object-[center_22%] scale-[2.35]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl bg-black shadow-soft ${FULL_SIZES[size]} ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Migajas"
        fill
        sizes="(max-width: 640px) 176px, 240px"
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
