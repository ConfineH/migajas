"use client";

interface AdminSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount: number;
  totalCount: number;
}

export function AdminSearch({
  value,
  onChange,
  placeholder = "Buscar…",
  resultCount,
  totalCount,
}: AdminSearchProps) {
  return (
    <div className="mb-6 space-y-2">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-input text-sm"
      />
      <p className="text-xs text-muted">
        Mostrando {resultCount} de {totalCount}
      </p>
    </div>
  );
}
