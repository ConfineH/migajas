const PROJECT_REF = "tqxxdajuguthwljzmqfe";
const SITE_URL = "https://migajas.vercel.app";

import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadDotEnv(path.join(process.cwd(), ".env.supabase"));
  loadDotEnv(path.join(process.cwd(), ".env.local"));

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error(
      "Falta SUPABASE_ACCESS_TOKEN. Créalo en https://supabase.com/dashboard/account/tokens",
    );
    console.error("Guárdalo en .env.supabase (no lo subas a git).");
    process.exit(1);
  }

  const payload = {
    site_url: SITE_URL,
    uri_allow_list: `${SITE_URL}/**,http://localhost:3000/**`,
    external_email_enabled: true,
    mailer_autoconfirm: false,
    password_hibp_enabled: true,
    password_min_length: 10,
  };

  const response = await fetch(
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

  const body = await response.text();
  if (!response.ok) {
    console.error("Error configurando Auth:", response.status, body);
    process.exit(1);
  }

  console.log("Auth configurado para Migajas:");
  console.log(`- Site URL: ${SITE_URL}`);
  console.log(`- Redirect URLs: ${payload.uri_allow_list}`);
  console.log("- Confirmación por email: activa");
  console.log("- Protección contraseñas filtradas (HIBP): activa");
  console.log("- Longitud mínima de contraseña: 10");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
