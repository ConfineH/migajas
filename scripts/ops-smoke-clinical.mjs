#!/usr/bin/env node
/**
 * Authenticated smoke test: profile, intake CRUD, clinical CSV/PDF export.
 * Requires .env.local with Supabase keys and NEXT_PUBLIC_SITE_URL.
 *
 * Usage: node scripts/ops-smoke-clinical.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = "tqxxdajuguthwljzmqfe";
const DEFAULT_EMAIL = "ops-smoke-clinical@migajas.test";
const DEFAULT_PASSWORD = "SmokeTest!2026Migajas";

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

function authCookie(session) {
  const name = `sb-${PROJECT_REF}-auth-token`;
  return `${name}=${encodeURIComponent(JSON.stringify(session))}`;
}

async function ensureSmokeUser(admin, email, password) {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  let user = list.users.find((item) => item.email === email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }

  const progress = {
    completions: [
      {
        levelId: "nivel-3",
        masteryScore: 80,
        correctCount: 8,
        totalCount: 10,
        completedAt: new Date().toISOString(),
        passed: true,
      },
    ],
    completedLessons: [],
    completedPracticeSteps: [],
    freeModeUnlocked: true,
  };

  const { error: profileError } = await admin.from("user_profiles").upsert({
    user_id: user.id,
    region_id: "do",
    clinical_mode_enabled: true,
    daily_carb_goal_g: 150,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  const { error: stateError } = await admin.from("user_learning_state").upsert({
    user_id: user.id,
    progress,
    attempts: [],
    updated_at: new Date().toISOString(),
  });
  if (stateError) throw stateError;

  return user;
}

async function main() {
  const local = loadEnvFile(path.join(root, ".env.local"));
  const url = local.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    local.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey =
    local.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const site = local.NEXT_PUBLIC_SITE_URL ?? "https://migajas.vercel.app";
  const email = process.env.SMOKE_TEST_EMAIL ?? DEFAULT_EMAIL;
  const password = process.env.SMOKE_TEST_PASSWORD ?? DEFAULT_PASSWORD;

  if (!url || !anonKey || !serviceKey) {
    console.error("Missing Supabase env vars in .env.local");
    process.exit(1);
  }

  console.log(`=== Clinical smoke (${site}) ===`);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await ensureSmokeUser(admin, email, password);

  const auth = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signInError } = await auth.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signIn.session) {
    throw signInError ?? new Error("No session after sign-in");
  }

  const cookie = authCookie(signIn.session);
  const today = new Date().toISOString().slice(0, 10);
  let ok = true;

  const profileRes = await fetch(`${site}/api/profile`, {
    headers: { Cookie: cookie },
  });
  ok =
    check("GET /api/profile", profileRes.status === 200, `status ${profileRes.status}`) &&
    ok;

  const postRes = await fetch(`${site}/api/intake`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({
      food_id: "casabe",
      meal_slot: "desayuno",
      local_date: today,
      portion_multiplier: 1,
    }),
  });
  const postBody = await postRes.json();
  ok =
    check("POST /api/intake", postRes.status === 200, `status ${postRes.status}`) && ok;

  const entryId = postBody.entry?.id;
  if (!entryId) {
    ok = check("Intake entry id", false, "missing in response") && false;
  }

  const listRes = await fetch(`${site}/api/intake?local_date=${today}`, {
    headers: { Cookie: cookie },
  });
  const listBody = await listRes.json();
  ok =
    check(
      "GET /api/intake",
      listRes.status === 200 && listBody.entries?.length >= 1,
      `${listBody.entries?.length ?? 0} entries`,
    ) && ok;

  const csvRes = await fetch(`${site}/api/clinical/export?format=csv&range=7d`, {
    headers: { Cookie: cookie },
  });
  const csvText = await csvRes.text();
  ok =
    check(
      "GET export CSV",
      csvRes.status === 200 && csvText.includes("section,date"),
      `status ${csvRes.status}`,
    ) && ok;

  const pdfRes = await fetch(`${site}/api/clinical/export?format=pdf&range=7d`, {
    headers: { Cookie: cookie },
  });
  const pdfBytes = await pdfRes.arrayBuffer();
  ok =
    check(
      "GET export PDF",
      pdfRes.status === 200 && pdfBytes.byteLength > 500,
      `${pdfBytes.byteLength} bytes`,
    ) && ok;

  if (entryId) {
    const deleteRes = await fetch(
      `${site}/api/intake?id=${entryId}&local_date=${today}`,
      {
        method: "DELETE",
        headers: { Cookie: cookie },
      },
    );
    ok =
      check("DELETE /api/intake", deleteRes.status === 200, `status ${deleteRes.status}`) &&
      ok;
  }

  console.log(ok ? "\nClinical smoke passed." : "\nClinical smoke failed.");
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
