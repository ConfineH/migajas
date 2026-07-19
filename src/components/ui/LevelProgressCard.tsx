import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface LevelProgressCardProps {
  title: string;
  percent: number;
  subtitle?: string;
  trailing?: React.ReactNode;
  className?: string;
  variant?: "bar" | "ring";
}

export function LevelProgressCard({
  title,
  percent,
  subtitle,
  trailing,
  className = "",
  variant = "bar",
}: LevelProgressCardProps) {
  if (variant === "ring") {
    return (
      <div className={`feature-card flex flex-col items-center p-6 text-center ${className}`}>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <ProgressRing percent={percent} className="my-5" />
        {subtitle ? (
          <p className="max-w-[16rem] text-pretty text-xs leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
        {trailing ? <div className="mt-3">{trailing}</div> : null}
      </div>
    );
  }

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
