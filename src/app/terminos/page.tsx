import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LEGAL_VERSIONS } from "@/lib/domain/legal-versions";
import { buildPageMetadata, PUBLIC_PAGE_SEO } from "@/lib/domain/seo";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.terminos);

export default function TermsPage() {
  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout className="prose prose-stone py-10">
          <h1 className="font-display">Términos y condiciones</h1>
          <p className="text-sm text-muted">
            Versión {LEGAL_VERSIONS.terms_of_service}. Última actualización: 16
            de septiembre de 2026.
          </p>

          <h2>1. Objeto</h2>
          <p>
            Migajas es una herramienta educativa para aprender a estimar
            carbohidratos con comida real. No es un dispositivo médico ni
            sustituye el consejo de un profesional sanitario.
          </p>

          <h2>2. Uso aceptable</h2>
          <ul>
            <li>Usar la app para aprender a contar carbohidratos, como paciente o como profesional que indica el curso.</li>
            <li>No intentar eludir controles de progreso ni acceder a datos ajenos.</li>
            <li>
              No usar Migajas para diagnóstico, ajuste de medicación ni
              recomendaciones terapéuticas automatizadas.
            </li>
          </ul>

          <h2>3. Seguimiento personal</h2>
          <p>
            El diario y los reportes son opcionales y requieren consentimiento
            explícito para datos de salud. Un profesional no abre tu diario: solo
            ve el informe si tú se lo envías. Puedes retirar ese consentimiento
            en cualquier momento desde Configuración; entonces borramos las
            copias enviadas.
          </p>

          <h2>4. Limitación de responsabilidad</h2>
          <p>
            El contenido educativo se ofrece &quot;tal cual&quot;. Las decisiones
            sobre tu salud deben tomarse con tu equipo sanitario.
          </p>

          <h2>5. Incidencias y contacto</h2>
          <p>
            Para reportar abusos, errores o solicitudes relacionadas con tus
            datos, usa Configuración o reclama ante la AEPD. Si operas Migajas
            en tu organización, sustituye este apartado por el canal del
            contrato.
          </p>

          <p className="text-sm text-muted">
            Condiciones de uso de esta instancia pública. La identidad mercantil
            completa se publicará con la primera licencia.
          </p>

          <p>
            <Link
              href="/privacidad"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              Política de privacidad
            </Link>
            {" · "}
            <Link
              href="/cookies"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              Política de cookies
            </Link>
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
