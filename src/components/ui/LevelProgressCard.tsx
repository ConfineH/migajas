import { ProgressBar } from "@/components/ui/ProgressBar";

interface LevelProgressCardProps {
  title: string;
  percent: number;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
}

export function LevelProgressCard({
  title,
  percent,
  subtitle,
  trailing,
  className = "",
}: LevelProgressCardProps) {
  return (
    <div
      className={`rounded-xl border border-emerald-100 bg-white p-4 ${className}`}
    >
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="shrink-0 text-emerald-600">{percent}%</span>
      </div>
      <ProgressBar percent={percent} className="mt-2" />
      {subtitle ? (
        <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
      ) : null}
      {trailing ? <div className="mt-2">{trailing}</div> : null}
    </div>
  );
}
