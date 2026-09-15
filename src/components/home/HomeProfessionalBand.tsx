import Link from "next/link";
import { PROFESSIONAL_PAGE } from "@/lib/domain/professional-cycle";

export function HomeProfessionalBand() {
  return (
    <section className="mt-16 feature-card px-6 py-8 sm:px-10 sm:py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-sage-strong">
        {PROFESSIONAL_PAGE.eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium text-foreground sm:text-3xl">
        {PROFESSIONAL_PAGE.headline}
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
        {PROFESSIONAL_PAGE.lead}
      </p>
      <Link
        href={PROFESSIONAL_PAGE.path}
        className="mt-5 inline-block text-sm font-medium text-sage-strong underline-offset-4 hover:text-foreground hover:underline"
      >
        Cómo indicar el curso →
      </Link>
    </section>
  );
}
