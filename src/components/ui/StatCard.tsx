interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="feature-card px-4 py-5 text-center">
      <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
