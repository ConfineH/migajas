const PROJECT_REF = "tqxxdajuguthwljzmqfe";
const SITE_URL = "https://migajas.vercel.app";

import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

async function patchAuth(accessToken, payload) {
  return fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

async function main() {
  loadDotEnv(path.join(process.cwd(), ".env.supabase"));
  loadDotEnv(path.join(process.cwd(), ".env.local"));

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error(
      "Falta SUPABASE_ACCESS_TOKEN. Créalo en https://supabase.com/dashboard/account/tokens",
    );
    console.error("Guárdalo en .env.local o .env.supabase (no lo subas a git).");
    process.exit(1);
  }

  const basePayload = {
    site_url: SITE_URL,
    uri_allow_list: `${SITE_URL}/**,http://localhost:3000/**`,
    external_email_enabled: true,
    mailer_autoconfirm: false,
    password_min_length: 10,
    security_update_password_require_reauthentication: true,
  };

  let payload = { ...basePayload, password_hibp_enabled: true };
  let response = await patchAuth(accessToken, payload);
  let body = await response.text();

  if (
    !response.ok &&
    response.status === 402 &&
    body.includes("leaked password")
  ) {
    console.warn(
      "HIBP no disponible en este plan (Pro+). Aplicando el resto de la política de contraseñas…",
    );
    payload = basePayload;
    response = await patchAuth(accessToken, payload);
    body = await response.text();
  }

  if (!response.ok) {
    console.error("Error configurando Auth:", response.status, body);
    process.exit(1);
  }

  console.log("Auth configurado para Migajas:");
  console.log(`- Site URL: ${SITE_URL}`);
  console.log(`- Redirect URLs: ${payload.uri_allow_list}`);
  console.log("- Confirmación por email: activa");
  console.log(`- Longitud mínima de contraseña: ${payload.password_min_length}`);
  console.log(
    `- Reautenticación al cambiar contraseña: ${payload.security_update_password_require_reauthentication ? "activa" : "inactiva"}`,
  );
  if ("password_hibp_enabled" in payload && payload.password_hibp_enabled) {
    console.log("- Protección contraseñas filtradas (HIBP): activa");
  } else {
    console.log(
      "- Protección contraseñas filtradas (HIBP): no disponible en plan Free",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
