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
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
      />
      <p className="text-xs text-gray-500">
        Mostrando {resultCount} de {totalCount}
      </p>
    </div>
  );
}
