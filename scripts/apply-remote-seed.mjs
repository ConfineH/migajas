#!/usr/bin/env node
/**
 * Apply generated content seed SQL to remote Supabase (foods, lessons, exams).
 * Requires .env.supabase with SUPABASE_ACCESS_TOKEN.
 *
 * Usage:
 *   npm run db:seed
 *   node scripts/apply-remote-seed.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "tqxxdajuguthwljzmqfe";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

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

async function runQuery(accessToken, sql) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Query failed (${response.status}): ${body}`);
  }
}

function splitSeedParts(sql) {
  return sql.split(/\n\n(?=INSERT INTO public\.)/);
}

async function main() {
  loadDotEnv(path.join(root, ".env.supabase"));

  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Missing SUPABASE_ACCESS_TOKEN in .env.supabase");
    console.error("Create one at https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }

  const sql = fs.readFileSync(
    path.join(root, "supabase/migrations/20260713160000_seed_content.sql"),
    "utf8",
  );

  const parts = splitSeedParts(sql);
  const labels = ["foods", "lessons", "exams"];

  for (let i = 0; i < parts.length; i++) {
    const label = labels[i] ?? `part-${i}`;
    console.log(`Applying seed: ${label}...`);
    await runQuery(accessToken, parts[i]);
    console.log(`  OK: ${label}`);
  }

  console.log("Content seed applied to", PROJECT_REF);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
