export function HomeBackgroundBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <svg
        className="absolute -left-24 top-32 h-72 w-72 opacity-70 sm:h-96 sm:w-96"
        viewBox="0 0 400 400"
        fill="none"
      >
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="150"
          fill="var(--sage)"
          transform="rotate(-12 200 200)"
        />
      </svg>
      <svg
        className="absolute -right-16 top-8 h-56 w-56 opacity-60 sm:h-80 sm:w-80"
        viewBox="0 0 320 320"
        fill="none"
      >
        <ellipse
          cx="160"
          cy="160"
          rx="140"
          ry="120"
          fill="var(--terracotta-soft)"
          transform="rotate(18 160 160)"
        />
      </svg>
      <svg
        className="absolute bottom-16 left-1/3 h-48 w-48 opacity-50"
        viewBox="0 0 280 280"
        fill="none"
      >
        <ellipse
          cx="140"
          cy="140"
          rx="120"
          ry="100"
          fill="var(--sage-muted)"
          transform="rotate(8 140 140)"
        />
      </svg>
    </div>
  );
}
