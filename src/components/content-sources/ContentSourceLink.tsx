import Link from "next/link";
import { getSourceById } from "@/lib/domain/content-sources";

interface ContentSourceLinkProps {
  sourceId: string;
  className?: string;
}

export function ContentSourceLink({ sourceId, className = "" }: ContentSourceLinkProps) {
  const source = getSourceById(sourceId);
  if (!source) return null;

  const isExternal = source.url.startsWith("http");
  const label = source.publisher === source.title ? source.publisher : source.publisher;

  if (isExternal) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-900 ${className}`}
      >
        Fuente: {label} ↗
      </a>
    );
  }

  return (
    <Link
      href={`${source.url}?tab=fuentes#${source.id}`}
      className={`inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-900 ${className}`}
    >
      Fuente: {label}
    </Link>
  );
}
