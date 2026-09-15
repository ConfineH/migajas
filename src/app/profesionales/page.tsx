import { AppNavBar } from "@/components/AppNavBar";
import { Button } from "@/components/Button";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  PROFESSIONAL_AUDIENCES,
  PROFESSIONAL_CAN,
  PROFESSIONAL_CANNOT,
  PROFESSIONAL_CYCLE_STEPS,
  PROFESSIONAL_NOT_DIRECTORY,
  PROFESSIONAL_PAGE,
  PROFESSIONAL_SCRIPT,
} from "@/lib/domain/professional-cycle";
import { buildPageMetadata, PUBLIC_PAGE_SEO } from "@/lib/domain/seo";
import { getAuthUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user-profile";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.profesionales);

export default async function ProfesionalesPage() {
  const user = await getAuthUser();
  const profile = user ? await getUserProfile(user.id) : null;
  const hasProfessionalProfile = profile?.is_professional === true;

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="wide">
          <p className="text-sm font-medium uppercase tracking-wide text-sage-strong">
            {PROFESSIONAL_PAGE.eyebrow}
          </p>
          <PageHeader
            title={PROFESSIONAL_PAGE.headline}
            description={PROFESSIONAL_PAGE.lead}
          />

          <div className="mb-12 flex flex-wrap gap-3">
            <Button href="/learn">{PROFESSIONAL_PAGE.ctaPrimary}</Button>
            <Button
              href={
                hasProfessionalProfile
                  ? "/profesional"
                  : user
                    ? "/profesional/alta"
                    : "/login?next=/profesional/alta"
              }
              variant="secondary"
            >
              {hasProfessionalProfile
                ? "Ir a tu perfil"
                : PROFESSIONAL_PAGE.ctaSecondary}
            </Button>
          </div>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-medium text-foreground">
              {PROFESSIONAL_PAGE.audienceHeading}
            </h2>
            <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted">
              {PROFESSIONAL_PAGE.audienceLead}
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {PROFESSIONAL_AUDIENCES.map((item, index) => (
                <li
                  key={item.title}
                  className={`feature-card p-6${
                    index === PROFESSIONAL_AUDIENCES.length - 1
                      ? " sm:col-span-2"
                      : ""
                  }`}
                >
                  <h3 className="font-display text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <ol className="mb-12 grid gap-4 sm:grid-cols-2">
            {PROFESSIONAL_CYCLE_STEPS.map((step, index) => (
              <li key={step.title} className="feature-card p-6">
                <p className="text-sm font-medium text-sage-strong">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <section className="callout-sage">
              <h2 className="font-display text-xl font-medium text-foreground">
                Qué puede hacer el profesional
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {PROFESSIONAL_CAN.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="callout-muted">
              <h2 className="font-display text-xl font-medium text-foreground">
                Qué no hace Migajas
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {PROFESSIONAL_CANNOT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <blockquote className="feature-card mb-10 p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-wide text-sage-strong">
              Guion de consulta
            </p>
            <p className="mt-3 font-display text-xl font-medium leading-snug text-foreground">
              «{PROFESSIONAL_SCRIPT}»
            </p>
          </blockquote>

          <p className="max-w-prose text-pretty text-sm leading-relaxed text-muted">
            {PROFESSIONAL_NOT_DIRECTORY}
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
