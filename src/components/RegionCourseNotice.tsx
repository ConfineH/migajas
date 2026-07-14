import Link from "next/link";

export function RegionCourseNotice({
  regionName,
}: {
  regionName: string;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-semibold text-amber-900">Curso en transición</p>
      <p className="mt-1 text-sm text-amber-800">
        Tienes seleccionada <strong>{regionName}</strong>. El catálogo y la guía
        ya usan tu región, pero el curso guiado sigue con ejemplos de España.
        Puedes cambiar la región en{" "}
        <Link href="/onboarding" className="font-semibold underline">
          Configuración
        </Link>
        .
      </p>
    </div>
  );
}
