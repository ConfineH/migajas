import type { ReactNode } from "react";
import type { RegionId } from "@/lib/domain/user-profile";

const FLAGS: Record<string, { label: string; svg: ReactNode }> = {
  es: {
    label: "Bandera de España",
    svg: (
      <>
        <rect width="3" height="2" fill="#C60B1E" />
        <rect y="0.5" width="3" height="1" fill="#FFC400" />
      </>
    ),
  },
  do: {
    label: "Bandera de República Dominicana",
    svg: (
      <>
        <rect width="3" height="2" fill="#fff" />
        <rect width="1.35" height="0.78" fill="#002D62" />
        <rect x="1.65" width="1.35" height="0.78" fill="#CE1126" />
        <rect y="1.22" width="1.35" height="0.78" fill="#CE1126" />
        <rect x="1.65" y="1.22" width="1.35" height="0.78" fill="#002D62" />
        <rect x="1.35" width="0.3" height="2" fill="#fff" />
        <rect y="0.78" width="3" height="0.44" fill="#fff" />
      </>
    ),
  },
};

interface RegionFlagProps {
  regionId: RegionId | string;
  className?: string;
}

/** Vector flags. Emoji flags render as “ES/DO” letters on Windows Chrome. */
export function RegionFlag({ regionId, className = "" }: RegionFlagProps) {
  const flag = FLAGS[regionId] ?? FLAGS.es;

  return (
    <svg
      viewBox="0 0 3 2"
      className={`h-8 w-12 overflow-hidden rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <title>{flag.label}</title>
      {flag.svg}
    </svg>
  );
}
