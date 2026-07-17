import Link from "next/link";
import { getSourceById } from "@/lib/domain/content-sources";

interface ContentSourceLinkProps {
  sourceId: string;
  className?: string;
  compact?: boolean;
}

export function ContentSourceLink({
  sourceId,
  className = "",
  compact = false,
}: ContentSourceLinkProps) {
  const source = getSourceById(sourceId);
  if (!source) return null;

  const isExternal = source.url.startsWith("http");
  const label = compact ? source.publisher : source.publisher;
  const text = compact ? label : `Fuente: ${label}`;

  if (isExternal) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 font-medium text-sage-strong underline-offset-2 hover:underline ${className}`}
      >
        {text} ↗
      </a>
    );
  }

  return (
    <Link
      href={`${source.url}?tab=fuentes#${source.id}`}
      className={`inline-flex items-center gap-1 font-medium text-sage-strong underline-offset-2 hover:underline ${className}`}
    >
      {text}
    </Link>
  );
}
