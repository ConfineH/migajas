interface IconProps {
  className?: string;
}

export function GuidedCourseIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        d="M12 14h28a4 4 0 014 4v34a4 4 0 01-4 4H12a4 4 0 01-4-4V18a4 4 0 014-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 14V10a4 4 0 014-4h16a4 4 0 014 4v4" />
      <path d="M20 26h20M20 34h14" strokeLinecap="round" />
      <path
        d="M42 42c3 0 6-2.5 6-5.5S45 31 42 31s-6 2.5-6 5.5 3 5.5 6 5.5z"
        fill="currentColor"
        stroke="none"
        opacity="0.25"
      />
      <path
        d="M42 38.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function FreePracticeIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <ellipse cx="32" cy="38" rx="18" ry="8" />
      <path d="M18 38c0-8 6-14 14-14s14 6 14 14" strokeLinecap="round" />
      <path d="M24 30c2-2 5-3 8-3s6 1 8 3" strokeLinecap="round" />
      <path
        d="M44 18l8 4-8 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M44 22h10" strokeLinecap="round" />
    </svg>
  );
}

export function ProgressSproutIcon({ className = "h-16 w-16" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M32 48V28" strokeLinecap="round" />
      <path
        d="M32 36c-8-2-12-8-12-14 6 0 10 3 12 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 32c8-2 12-8 12-14-6 0-10 3-12 8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 48h16" strokeLinecap="round" />
    </svg>
  );
}
