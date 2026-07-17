import Link from "next/link";
import { AppNavBar } from "@/components/AppNavBar";

export const metadata = {
  title: "Privacidad — Migajas",
};

export default function PrivacyPage() {
  return (
    <>
      <AppNavBar />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 prose prose-stone">
        <h1>Política de privacidad</h1>
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

        <p className="text-sm text-gray-600">
          Plantilla operativa — revisión legal obligatoria antes de uso clínico
          en la UE.
        </p>

        <p>
          <Link href="/onboarding" className="text-emerald-700 underline">
            Volver a configuración
          </Link>
        </p>
      </main>
    </>
  );
}
