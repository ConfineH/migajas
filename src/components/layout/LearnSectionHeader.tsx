import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface LearnSectionHeaderProps {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  description?: string;
  progressPercent?: number;
}

export function LearnSectionHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  progressPercent,
}: LearnSectionHeaderProps) {
  return (
    <header className="mb-8">
      <Link
        href={backHref}
        className="text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
      >
        ← {backLabel}
      </Link>
      {eyebrow ? (
        <p className="mt-3 text-sm font-medium text-muted">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 font-display text-3xl font-medium text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-pretty text-muted">{description}</p>
      ) : null}
      {progressPercent !== undefined ? (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm text-muted">
            <span>Progreso</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <ProgressBar percent={progressPercent} />
        </div>
      ) : null}
    </header>
  );
}
