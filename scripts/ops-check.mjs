#!/usr/bin/env node
/**
 * Pre-flight checks for Migajas deploy/ops.
 * Usage: node scripts/ops-check.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = "tqxxdajuguthwljzmqfe";
const EXPECTED_SITE = "https://migajas.vercel.app";

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
  console.log(`${ok ? "OK" : "MISSING"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const local = loadEnvFile(path.join(root, ".env.local"));
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_EMAILS",
    "CLINICAL_MODE_ENABLED",
  ];

  console.log("=== Local env (.env.local) ===");
  let envOk = true;
  for (const key of required) {
    const value = local[key] ?? process.env[key];
    const ok = Boolean(value && value !== "your-anon-key");
    envOk = check(key, ok, ok ? undefined : "set in .env.local and Vercel") && envOk;
  }

  console.log("\n=== Remote Supabase (public health) ===");
  const supabaseUrl = local.NEXT_PUBLIC_SUPABASE_URL ?? `https://${PROJECT_REF}.supabase.co`;
  let remoteOk = true;
  try {
    const health = await fetchJson(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: local.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
    });
    remoteOk = check("Supabase auth health", health?.version != null, supabaseUrl) && remoteOk;
  } catch (error) {
    remoteOk = check("Supabase auth health", false, String(error)) && false;
  }

  console.log("\n=== Production URL ===");
  let siteOk = true;
  try {
    const response = await fetch(EXPECTED_SITE, { redirect: "follow" });
    siteOk = check("Vercel site responds", response.ok, `${EXPECTED_SITE} (${response.status})`) && siteOk;
  } catch (error) {
    siteOk = check("Vercel site responds", false, String(error)) && false;
  }

  console.log("\n=== Summary ===");
  if (envOk && remoteOk && siteOk) {
    console.log("Ready for smoke test (see docs/commercial/DEPLOYMENT.md §4).");
    process.exit(0);
  }

  console.log("Fix missing items above, then redeploy on Vercel if env changed.");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
