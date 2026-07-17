import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ENV_FILE = path.join(process.cwd(), ".env.local");
const TARGETS = ["production", "preview"];

const SENSITIVE = new Set([
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);

const SKIP = new Set(["SUPABASE_ACCESS_TOKEN"]);

function loadEnv(filePath) {
  const vars = new Map();
  if (!fs.existsSync(filePath)) return vars;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && value) vars.set(key, value);
  }
  return vars;
}

function syncVar(name, value, target) {
  const args = [
    "vercel@latest",
    "env",
    "add",
    name,
    target,
    "--value",
    value,
    "--force",
    "--yes",
    "--non-interactive",
  ];
  if (SENSITIVE.has(name)) {
    args.push("--sensitive");
  }

  const result = spawnSync("npx", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`Failed ${name} (${target}):`, result.stderr || result.stdout);
    return false;
  }

  console.log(`OK ${name} → ${target}`);
  return true;
}

const vars = loadEnv(ENV_FILE);
let failed = 0;

for (const [name, value] of vars) {
  if (SKIP.has(name)) continue;
  for (const target of TARGETS) {
    if (!syncVar(name, value, target)) failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("Vercel env sync complete.");
