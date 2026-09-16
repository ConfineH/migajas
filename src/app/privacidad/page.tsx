import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";
import { LEGAL_VERSIONS } from "@/lib/domain/legal-versions";
import { buildPageMetadata, getSiteUrl, PUBLIC_PAGE_SEO } from "@/lib/domain/seo";

export const metadata = buildPageMetadata(PUBLIC_PAGE_SEO.privacidad);

export default function PrivacyPage() {
  const siteUrl = getSiteUrl().replace(/^https:\/\//, "");

  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout className="prose prose-stone py-10">
          <h1 className="font-display">Política de privacidad</h1>
          <p className="text-sm text-muted">
            Versión {LEGAL_VERSIONS.privacy_policy}. Última actualización: 16 de
            septiembre de 2026.
          </p>
          <p>
            Migajas es una herramienta educativa para aprender a estimar
            carbohidratos. No es un dispositivo médico ni sustituye el consejo de
            un profesional sanitario.
          </p>

          <h2>Quién es el responsable</h2>
          <p>
            En esta instancia pública ({siteUrl}), el responsable del
            tratamiento es quien opera Migajas. Todavía no hay una sociedad
            mercantil ni un NIF publicados. Para ejercer tus derechos usa
            Configuración (exportar o borrar la cuenta). Tienes derecho a
            reclamar ante la Agencia Española de Protección de Datos (
            <a
              href="https://www.aepd.es"
              rel="noreferrer"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              aepd.es
            </a>
            ).
          </p>

          <h2>Datos que tratamos</h2>
          <ul>
            <li>Cuenta (email, nombre de perfil)</li>
            <li>Progreso del curso y preferencias de región</li>
            <li>
              Datos de salud opcionales al activar el seguimiento personal (registro de
              ingesta)
            </li>
            <li>
              Si envías un informe a un profesional, una copia de ese resumen en
              su perfil. El diario no se envía solo: lo mandas tú, después de
              ver a quién va.
            </li>
          </ul>

          <h2>Base legal (RGPD)</h2>
          <ul>
            <li>Servicio educativo (art. 6.1.b)</li>
            <li>
              Datos de salud del diario: consentimiento explícito (art. 9.2.a) al
              activar el seguimiento personal
            </li>
            <li>
              Cesión de un informe a un profesional: tu envío confirmado (art.
              9.2.a). Si retiras el consentimiento, borramos esas copias.
            </li>
          </ul>

          <h2>Tus derechos</h2>
          <p>
            Puedes acceder, rectificar, exportar y solicitar la supresión de tus
            datos desde Configuración si has iniciado sesión. También puedes
            reclamar ante la AEPD.
          </p>

          <h2>Cookies</h2>
          <p>
            Usamos cookies técnicas para sesión, progreso y onboarding. No usamos
            cookies publicitarias de terceros en la versión base. Consulta el{" "}
            <Link
              href="/cookies"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              inventario de cookies
            </Link>
            .
          </p>

          <h2>Registro de consentimientos</h2>
          <p>
            Si tienes cuenta, guardamos la fecha y versión del texto legal cuando
            aceptas cookies o activas el seguimiento personal. Puedes exportar este
            historial desde Configuración.
          </p>

          <p className="text-sm text-muted">
            Plantilla operativa actualizada el 16 de septiembre de 2026. La
            identidad mercantil completa se publicará con la primera licencia.
          </p>

          <p>
            <Link
              href="/onboarding"
              className="font-medium text-sage-strong underline-offset-2 hover:underline"
            >
              Volver a configuración
            </Link>
          </p>
        </AppPageLayout>
      </main>
    </>
  );
}
