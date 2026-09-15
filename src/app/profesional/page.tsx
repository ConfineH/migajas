import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavBar } from "@/components/AppNavBar";
import { ProfessionalContactForm } from "@/components/professional/ProfessionalContactForm";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PROFESSIONAL_CONTENT_LINKS, professionalRoleLabel } from "@/lib/domain/professional-profile";
import { getAuthUser } from "@/lib/supabase/auth";
import {
  listProfessionalContacts,
  listSharesForProfessional,
} from "@/lib/supabase/professional";
import { getUserProfile } from "@/lib/supabase/user-profile";
import { NOINDEX_METADATA } from "@/lib/domain/seo";

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

  const [shares, messages] = await Promise.all([
    listSharesForProfessional(user.id),
    listProfessionalContacts(user.id),
  ]);
  const roleLabel = professionalRoleLabel(profile.professional_role);

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout width="wide">
          <PageHeader
            title="Tu perfil profesional"
            description={
              roleLabel
                ? `${roleLabel}. Da este código a quien quiera enviarte un informe.`
                : "Da este código a quien quiera enviarte un informe."
            }
          />

          <p className="mb-10 font-mono text-3xl tracking-[0.3em] text-sage-strong">
            {profile.professional_share_code}
          </p>

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
              Solo ves lo que la persona te envía. No es el diario en directo ni
              la historia clínica.
            </p>
            {shares.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-sage-light/60 px-5 py-4 text-sm text-muted">
                Aún no te han enviado informes. Comparte tu código en consulta.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {shares.map((share) => (
                  <li key={share.id}>
                    <Link
                      href={`/profesional/informes/${share.id}`}
                      className="feature-card block p-5 hover:bg-sage-light/40"
                    >
                      <p className="font-medium text-foreground">
                        Del {share.range_from} al {share.range_to}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Enviado el {share.created_at.slice(0, 10)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-medium text-foreground">
                Escribir a administración
              </h2>
              <p className="mt-2 mb-4 text-sm text-muted">
                Dudas sobre el catálogo, el curso o el piloto.
              </p>
              <ProfessionalContactForm />
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
