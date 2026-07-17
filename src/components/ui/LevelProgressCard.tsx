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
    <div className={`feature-card p-4 ${className}`}>
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{title}</span>
        <span className="shrink-0 tabular-nums text-sage-strong">{percent}%</span>
      </div>
      <ProgressBar percent={percent} className="mt-2" />
      {subtitle ? (
        <p className="mt-2 text-xs text-muted">{subtitle}</p>
      ) : null}
      {trailing ? <div className="mt-2">{trailing}</div> : null}
    </div>
  );
}
