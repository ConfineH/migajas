import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";
import { AppPageLayout } from "@/components/layout/AppPageLayout";

export const metadata = {
  title: "Privacidad — Migajas",
};

export default function PrivacyPage() {
  return (
    <>
      <AppNavBar />
      <main className="flex flex-1 flex-col">
        <AppPageLayout className="prose prose-stone py-10">
          <h1 className="font-display">Política de privacidad</h1>
          <p>
            Migajas es una herramienta educativa para aprender a estimar
            carbohidratos. No es un dispositivo médico ni sustituye el consejo de
            un profesional sanitario.
          </p>

          <h2>Datos que tratamos</h2>
          <ul>
            <li>Cuenta (email, nombre de perfil)</li>
            <li>Progreso del curso y preferencias de región</li>
            <li>
              Datos de salud opcionales al activar el modo clínico (registro de
              ingesta)
            </li>
          </ul>

          <h2>Base legal (RGPD)</h2>
          <ul>
            <li>Servicio educativo (art. 6.1.b)</li>
            <li>
              Datos de salud del diario: consentimiento explícito (art. 9.2.a) al
              activar el modo clínico
            </li>
          </ul>

          <h2>Tus derechos</h2>
          <p>
            Puedes acceder, rectificar, exportar y solicitar la supresión de tus
            datos desde Configuración si has iniciado sesión. También puedes
            contactar al responsable del tratamiento indicado en el despliegue de
            tu organización.
          </p>

          <h2>Cookies</h2>
          <p>
            Usamos cookies técnicas para sesión, progreso y onboarding. No usamos
            cookies publicitarias de terceros en la versión base.
          </p>

          <p className="text-sm text-muted">
            Plantilla operativa — revisión legal obligatoria antes de uso clínico
            en la UE.
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
