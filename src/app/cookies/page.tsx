import Link from "next/link";
import { cookies } from "next/headers";
import { AppNavBar } from "@/components/AppNavBar";
import { CookiePreferencesPanel } from "@/components/CookiePreferencesPanel";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import {
  COOKIE_CONSENT_COOKIE,
  parseCookieConsent,
} from "@/lib/domain/cookie-consent";
import { getCookieInventory, LEGAL_VERSIONS } from "@/lib/domain/legal-versions";

export const metadata = {
  title: "Política de cookies — Migajas",
};

export default async function CookiesPage() {
  const cookieStore = await cookies();
  const currentPreference = parseCookieConsent(
    cookieStore.get(COOKIE_CONSENT_COOKIE)?.value,
  );

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout className="prose prose-stone py-10">
          <h1 className="font-display">Política de cookies</h1>
          <p className="text-sm text-muted">
            Versión {LEGAL_VERSIONS.cookie_notice}. Última actualización: 23 de
            julio de 2026.
          </p>
          <p>
            Migajas usa cookies y almacenamiento local para ofrecer el curso,
            guardar tu progreso y recordar tus preferencias. No usamos cookies
            publicitarias ni de seguimiento de terceros en la versión base.
          </p>

          <h2>Inventario de cookies</h2>
          <div className="not-prose overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Titular</th>
                  <th className="py-2 pr-4 font-medium">Finalidad</th>
                  <th className="py-2 pr-4 font-medium">Categoría</th>
                  <th className="py-2 font-medium">Duración</th>
                </tr>
              </thead>
              <tbody>
                {getCookieInventory().map((item) => (
                  <tr key={item.name} className="border-b border-border/60">
                    <td className="py-3 pr-4 font-mono text-xs">{item.name}</td>
                    <td className="py-3 pr-4">{item.owner}</td>
                    <td className="py-3 pr-4">{item.purpose}</td>
                    <td className="py-3 pr-4 capitalize">{item.category}</td>
                    <td className="py-3">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CookiePreferencesPanel initialPreference={currentPreference} />

          <p>
            Más información en nuestra{" "}
            <Link
              href="/privacidad"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              política de privacidad
            </Link>
            .
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
