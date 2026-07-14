interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={`h-2.5 overflow-hidden rounded-full bg-gray-100 ${className}`}
    >
      <div
        className="h-full rounded-full bg-emerald-500 transition-[width]"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
