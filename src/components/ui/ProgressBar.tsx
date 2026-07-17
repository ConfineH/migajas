interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`h-2 overflow-hidden rounded-full bg-sage-muted/40 ${className}`}
    >
      <div
        className="h-full rounded-full bg-sage-strong transition-[width] duration-300"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
