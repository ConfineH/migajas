#!/usr/bin/env node
/**
 * Post-deploy smoke: RD curriculum markers + public routes.
 * Usage: node scripts/ops-smoke-deploy.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

function check(name, ok, detail) {
  console.log(`${ok ? "OK" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function setDominicanOnboarding(site) {
  const response = await fetch(`${site}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      regionId: "do",
      guestMode: true,
      completed: true,
    }),
  });
  if (!response.ok) {
    throw new Error(`onboarding ${response.status}`);
  }
  const setCookie = response.headers.get("set-cookie") ?? "";
  return setCookie.split(";")[0];
}

async function main() {
  const local = loadEnvFile(path.join(root, ".env.local"));
  const site = local.NEXT_PUBLIC_SITE_URL ?? "https://migajas.vercel.app";

  console.log(`=== Deploy smoke (${site}) ===`);
  let ok = true;

  const home = await fetch(site);
  ok = check("GET /", home.ok, `status ${home.status}`) && ok;

  const login = await fetch(`${site}/login`);
  const loginHtml = await login.text();
  ok =
    check(
      "Login page",
      login.ok && loginHtml.includes("Continuar con Google"),
      "Google OAuth button",
    ) && ok;

  const diary = await fetch(`${site}/diario`);
  const diaryHtml = await diary.text();
  ok =
    check(
      "Diario guest gate",
      diary.ok && diaryHtml.includes("Inicia sesión"),
      "auth required",
    ) && ok;

  const admin = await fetch(`${site}/admin`, { redirect: "manual" });
  ok =
    check(
      "Admin blocked for guests",
      admin.status === 307 || admin.status === 302 || admin.url === `${site}/`,
      `status ${admin.status}`,
    ) && ok;

  const onboardingCookie = await setDominicanOnboarding(site);
  const learn = await fetch(`${site}/learn`, {
    headers: { Cookie: onboardingCookie },
  });
  const learnHtml = await learn.text();
  ok =
    check(
      "RD curriculum nivel 1",
      learnHtml.includes("Casabe") || learnHtml.includes("casabe"),
      "localized description",
    ) && ok;
  ok =
    check(
      "RD curriculum nivel 4",
      learnHtml.includes("Mangú") || learnHtml.includes("habichuelas"),
      "localized platos",
    ) && ok;
  ok =
    check(
      "RD plain language",
      !learnHtml.toLowerCase().includes("viandas"),
      "no viandas jargon",
    ) && ok;

  const guia = await fetch(`${site}/guia`, {
    headers: { Cookie: onboardingCookie },
  });
  const guiaHtml = await guia.text();
  ok =
    check(
      "Guía RD rules",
      guia.ok && guiaHtml.includes("15 g de carbohidratos"),
      "exchange rule",
    ) && ok;

  console.log(ok ? "\nDeploy smoke passed." : "\nDeploy smoke failed.");
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
