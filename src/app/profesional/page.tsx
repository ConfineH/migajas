import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CopyRecommendLink } from "@/components/professional/CopyRecommendLink";
import { PROFESSIONAL_CONTENT_LINKS, professionalRoleLabel } from "@/lib/domain/professional-profile";
import { getRegionById, recommendCourseUrl } from "@/lib/domain/regions";
import { getSiteUrl, NOINDEX_METADATA } from "@/lib/domain/seo";
import { recommendCourseQrDataUrl } from "@/lib/recommend-qr";
import { getAuthUser } from "@/lib/supabase/auth";
import { listProfessionalContacts } from "@/lib/supabase/professional";
import { getUserProfile } from "@/lib/supabase/user-profile";

export const metadata = NOINDEX_METADATA;
export const dynamic = "force-dynamic";

export default async function ProfessionalDashboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/profesional");
  }

  const profile = await getUserProfile(user.id);
  if (!profile?.is_professional) {
    redirect("/profesional/alta");
  }

  const messages = await listProfessionalContacts(user.id);
  const roleLabel = professionalRoleLabel(profile.professional_role);
  const region = getRegionById(profile.region_id);
  const recommendUrl = recommendCourseUrl(getSiteUrl(), region.id);
  const recommendQr = await recommendCourseQrDataUrl(recommendUrl);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="wide">
          <PageHeader
            title="Tu perfil profesional"
            description={
              roleLabel
                ? `${roleLabel}. Indica el curso con el enlace. El código es solo para el informe.`
                : "Indica el curso con el enlace. El código es solo para el informe."
            }
          />

          <section className="mb-12 grid gap-6 lg:grid-cols-2">
            <article className="feature-card p-6">
              <h2 className="font-display text-2xl font-medium text-foreground">
                Indica el curso
              </h2>
              <p className="mt-2 text-sm text-muted">
                Comparte el enlace o el código QR. Abre Migajas en{" "}
                {region.name}. La persona puede cambiar el país. No queda
                vinculada a tu perfil.
              </p>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Generated data URL. next/image does not optimize it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={recommendQr}
                  alt={`Código QR que abre Migajas en ${region.name}`}
                  width={140}
                  height={140}
                  className="size-36 shrink-0 rounded-2xl"
                />
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm text-foreground">
                    {recommendUrl}
                  </p>
                  <CopyRecommendLink url={recommendUrl} />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">
                El país es el de tu cuenta.{" "}
                <Link
                  href="/onboarding"
                  className="font-medium text-sage-strong underline-offset-2 hover:underline"
                >
                  Cámbialo en Configuración
                </Link>
                .
              </p>
            </article>

            <article className="feature-card p-6">
              <h2 className="font-display text-2xl font-medium text-foreground">
                Informes
              </h2>
              <p className="mt-2 text-sm text-muted">
                La recepción de informes está suspendida. El código de
                compartición no se muestra. Las copias ya enviadas no se han
                borrado: quien las envió puede consultarlas y retirarlas.
              </p>
            </article>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Revisar el contenido
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Entra al curso como lo ve la persona. No cambia su progreso.
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {PROFESSIONAL_CONTENT_LINKS.map((item) => (
                <li key={item.href} className="feature-card p-6">
                  <h3 className="font-display text-xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.body}</p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
                  >
                    Abrir →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Informes recibidos
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted">
              La lectura de informes recibidos está suspendida. No se muestra
              el contenido. Las copias siguen guardadas para quien las envió.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-medium text-foreground">
                Escribir a administración
              </h2>
              <p className="mt-2 text-sm text-muted">
                Los mensajes nuevos están suspendidos. Los que ya enviaste
                siguen en esta página.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-medium text-foreground">
                Mensajes enviados
              </h2>
              {messages.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Todavía no hay mensajes.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {messages.map((message) => (
                    <li key={message.id} className="rounded-2xl bg-sage-light/50 px-4 py-3">
                      <p className="font-medium text-foreground">{message.subject}</p>
                      <p className="mt-1 line-clamp-3 text-sm text-muted">
                        {message.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </AppPageLayout>
      </main>
    </>
  );
}
