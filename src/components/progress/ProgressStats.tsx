"use client";

import CountUp from "@/components/react-bits/CountUp";

function StatCardShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="feature-card px-4 py-5 text-center">
      <p className="font-display text-2xl font-medium tabular-nums text-sage-strong">
        {children}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

export function ProgressStats({
  passed,
  totalLevels,
  accuracy,
  reviewCount,
}: {
  passed: number;
  totalLevels: number;
  accuracy: number;
  reviewCount: number;
}) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCardShell label="Niveles aprobados">
        <CountUp to={passed} duration={1} />
        <span>/{totalLevels}</span>
      </StatCardShell>
      <StatCardShell label="Aciertos totales">
        <CountUp to={accuracy} duration={1.2} suffix="%" />
      </StatCardShell>
      <div className="col-span-2 sm:col-span-1">
        <StatCardShell label="Para repasar">
          <CountUp to={reviewCount} duration={1} />
        </StatCardShell>
      </div>
    </div>
  );
}
