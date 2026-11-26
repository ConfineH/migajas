const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync, spawn, spawnSync } = require("child_process");

// Real PostgreSQL + real PostgREST, on localhost only.
// Creates and drops migajas_s2_shares. Refuses any host other than
// 127.0.0.1 or localhost, and refuses a URL that points at Supabase.
const repoRoot = path.resolve(__dirname, "..");
const repoMigrations = path.join(repoRoot, "supabase", "migrations");
const migrationName = "20261124180000_suspend_professional_shares.sql";
const s1Name = "20261124120000_lock_user_profile_professional_columns.sql";
const s3Name = "20261125120000_suspend_clinical_surface.sql";
const migrationFile = path.join(repoMigrations, migrationName);
const reportFile = path.join(
  __dirname,
  "professional_share_suspension.integration.result.json",
);
const DB = "migajas_s2_shares";
const JWT_SECRET = "s2-local-jwt-secret-not-for-production-use";
const AUTH_PASSWORD = "s2-local-only";
const PORT = Number(process.env.S2_POSTGREST_PORT || 54322);

const PATIENT = "11111111-1111-4111-8111-111111111111";
const PROFESSIONAL = "22222222-2222-4222-8222-222222222222";
const STRANGER = "33333333-3333-4333-8333-333333333333";
const OTHER = "44444444-4444-4444-8444-444444444444";
const DELETE_ME = "55555555-5555-4555-8555-555555555555";

const KNOWN_REPLAY_GAPS = new Set([
  "20260713160000_seed_content.sql",
  "20260714160300_lock_admin_rpc.sql",
]);
const DEFER = new Set([s1Name, migrationName, s3Name]);

function assertLocalOnly() {
  const host = process.env.PGHOST || "127.0.0.1";
  const target = `${host} ${process.env.PGDATABASE || ""} ${process.env.DATABASE_URL || ""}`;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`Refusing non-local PostgreSQL host ${host}`);
  }
  if (/supabase\.co|tqxxdajuguthwljzmqfe/i.test(target)) {
    throw new Error("Refusing a Supabase or production target");
  }
}

function useTcp() {
  return Boolean(process.env.PGPASSWORD);
}

function psqlArgs(database) {
  const common = ["-d", database, "-v", "ON_ERROR_STOP=1", "-X", "-q"];
  if (useTcp()) {
    return [
      "psql",
      "-h",
      process.env.PGHOST || "127.0.0.1",
      "-p",
      process.env.PGPORT || "5432",
      "-U",
      process.env.PGUSER || "postgres",
      ...common,
    ];
  }
  return ["sudo", "-u", "postgres", "psql", ...common];
}

function psql(database, sql, extraArgs = []) {
  const args = psqlArgs(database);
  return spawnSync(args[0], [...args.slice(1), ...extraArgs], {
    input: sql,
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      PGPASSWORD: process.env.PGPASSWORD,
      PGUSER: process.env.PGUSER,
    },
  });
}

function execSql(database, sql) {
  const result = psql(database, sql);
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "psql failed").trim());
  }
  return result.stdout;
}

function queryJson(database, sql) {
  const result = psql(database, sql, ["-t", "-A"]);
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "psql failed").trim());
  }
  const line = result.stdout.trim();
  return line ? JSON.parse(line) : null;
}

function signJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function token(role, sub) {
  const now = Math.floor(Date.now() / 1000);
  return signJwt({ role, sub, iat: now, exp: now + 600 });
}

async function api(method, pathName, { bearer, body, prefer } = {}) {
  const headers = { Accept: "application/json" };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(`http://127.0.0.1:${PORT}${pathName}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: response.status, json };
}

function denied(response) {
  return (
    (response.status === 401 || response.status === 403) &&
    response.json?.code === "42501"
  );
}

function startPostgrest(bin) {
  const child = spawn(bin, [], {
    env: {
      PATH: process.env.PATH,
      PGRST_DB_URI: `postgres://authenticator:${AUTH_PASSWORD}@127.0.0.1:${process.env.PGPORT || 5432}/${DB}`,
      PGRST_DB_SCHEMAS: "public",
      PGRST_DB_ANON_ROLE: "anon",
      PGRST_JWT_SECRET: JWT_SECRET,
      PGRST_SERVER_HOST: "127.0.0.1",
      PGRST_SERVER_PORT: String(PORT),
      PGRST_DB_CHANNEL_ENABLED: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });
  return { child, getLogs: () => logs };
}

async function waitUntilReady(getLogs) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/`);
      if (response.ok) return;
    } catch {
      // PostgREST is still binding the port.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`PostgREST did not listen on ${PORT}:\n${getLogs()}`);
}

function applyMigrations() {
  const notes = [];
  const files = fs
    .readdirSync(repoMigrations)
    .filter((name) => name.endsWith(".sql") && !DEFER.has(name))
    .sort();
  for (const name of files) {
    const result = psql(DB, "", ["-f", path.join(repoMigrations, name)]);
    if (result.status !== 0) {
      const message = (result.stderr || result.stdout || "").split("\n")[0];
      if (KNOWN_REPLAY_GAPS.has(name)) {
        notes.push({ file: name, applied: false, message });
        continue;
      }
      throw new Error(`migration failed ${name}: ${message}`);
    }
  }
  return notes;
}

async function main() {
  assertLocalOnly();
  const headAtRun = execSync("git rev-parse HEAD", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (process.env.S2_EXPECT_COMMIT && process.env.S2_EXPECT_COMMIT !== headAtRun) {
    throw new Error(
      `integration HEAD ${headAtRun} does not match S2_EXPECT_COMMIT ${process.env.S2_EXPECT_COMMIT}`,
    );
  }

  const postgrestBin = process.env.POSTGREST_BIN || "postgrest";
  const versionProbe = spawnSync(postgrestBin, ["--version"], { encoding: "utf8" });
  if (versionProbe.status !== 0 && versionProbe.error) {
    throw new Error(
      `PostgREST binary not found (${postgrestBin}). Set POSTGREST_BIN. Do not point this script at production.`,
    );
  }
  const postgrestVersion = (versionProbe.stdout || versionProbe.stderr || "").trim();
  const postgresVersion = queryJson(
    "postgres",
    "select json_build_object('version', version())",
  ).version;

  execSql(
    "postgres",
    `
    select pg_terminate_backend(pid)
    from pg_stat_activity
    where datname = '${DB}' and pid <> pg_backend_pid();
    drop database if exists ${DB};
    create database ${DB};
    `,
  );

  execSql(
    DB,
    `
    drop role if exists authenticator;
    drop role if exists anon;
    drop role if exists authenticated;
    drop role if exists service_role;
    create role anon nologin nosuperuser nobypassrls;
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
    create role authenticator noinherit login password '${AUTH_PASSWORD}';
    grant anon, authenticated, service_role to authenticator;
    grant usage on schema public to anon, authenticated, service_role, authenticator;
    grant connect on database ${DB} to authenticator;
    create schema if not exists auth;
    grant usage on schema auth to anon, authenticated, service_role, authenticator;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid()
    returns uuid language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      )::uuid;
    $$;
    create function auth.role()
    returns text language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.role', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
      )::text;
    $$;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    grant execute on function auth.role() to anon, authenticated, service_role;
    alter default privileges for role postgres in schema public
      grant all on tables to anon, authenticated, service_role;
    alter default privileges for role postgres in schema public
      grant execute on functions to anon, authenticated, service_role;
    `,
  );

  const migrationNotes = applyMigrations();
  execSql(
    DB,
    `
    insert into auth.users (id, email) values
      ('${PATIENT}', 'patient@example.test'),
      ('${PROFESSIONAL}', 'professional@example.test'),
      ('${STRANGER}', 'stranger@example.test'),
      ('${OTHER}', 'other@example.test'),
      ('${DELETE_ME}', 'delete-me@example.test');
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled,
      is_professional, professional_role, professional_share_code
    ) values
      ('${PATIENT}', 'es', 150, false, false, null, null),
      ('${PROFESSIONAL}', 'es', 200, true, true, 'endocrinologia', 'AAAAAA'),
      ('${STRANGER}', 'es', 180, true, true, 'nutricion', 'BBBBBB'),
      ('${OTHER}', 'es', 160, false, false, null, null),
      ('${DELETE_ME}', 'es', 140, false, false, null, null);
    insert into public.professional_report_shares (
      professional_user_id, patient_user_id, range_from, range_to, snapshot
    ) values
      ('${PROFESSIONAL}', '${PATIENT}', '2026-01-01', '2026-01-07', '{"source":"historical"}'),
      ('${PROFESSIONAL}', '${DELETE_ME}', '2026-02-01', '2026-02-07', '{"source":"delete-me"}');
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values
      ('${PATIENT}', '${PROFESSIONAL}', 'endocrinologia'),
      ('${DELETE_ME}', '${PROFESSIONAL}', 'otro');
    `,
  );
  const before = queryJson(
    DB,
    `
    select json_build_object(
      'contacts', (select count(*) from public.patient_professional_contacts),
      'shares', (select count(*) from public.professional_report_shares)
    )
    `,
  );
  for (const name of [s1Name, migrationName]) {
    const applied = psql(DB, "", ["-f", path.join(repoMigrations, name)]);
    if (applied.status !== 0) {
      throw new Error((applied.stderr || applied.stdout || name).trim());
    }
  }
  const after = queryJson(
    DB,
    `
    select json_build_object(
      'contacts', (select count(*) from public.patient_professional_contacts),
      'shares', (select count(*) from public.professional_report_shares)
    )
    `,
  );

  const privileges = queryJson(
    DB,
    `
    select row_to_json(t) from (
      select
        has_table_privilege('authenticated', 'public.patient_professional_contacts', 'SELECT') as auth_contact_select,
        has_table_privilege('authenticated', 'public.patient_professional_contacts', 'INSERT') as auth_contact_insert,
        has_table_privilege('authenticated', 'public.patient_professional_contacts', 'UPDATE') as auth_contact_update,
        has_table_privilege('authenticated', 'public.patient_professional_contacts', 'DELETE') as auth_contact_delete,
        has_table_privilege('anon', 'public.patient_professional_contacts', 'INSERT') as anon_contact_insert,
        has_table_privilege('anon', 'public.patient_professional_contacts', 'TRUNCATE') as anon_contact_truncate,
        has_table_privilege('service_role', 'public.patient_professional_contacts', 'INSERT') as service_contact_insert,
        has_table_privilege('service_role', 'public.patient_professional_contacts', 'DELETE') as service_contact_delete,
        has_table_privilege('authenticated', 'public.professional_report_shares', 'INSERT') as auth_share_insert,
        has_table_privilege('authenticated', 'public.professional_report_shares', 'DELETE') as auth_share_delete,
        has_table_privilege('service_role', 'public.professional_report_shares', 'INSERT') as service_share_insert,
        has_table_privilege('service_role', 'public.professional_report_shares', 'DELETE') as service_share_delete,
        has_function_privilege('public', 'public.share_report_with_professional(text, date, date, jsonb)', 'EXECUTE') as public_share_exec,
        has_function_privilege('anon', 'public.share_report_with_professional(text, date, date, jsonb)', 'EXECUTE') as anon_share_exec,
        has_function_privilege('authenticated', 'public.share_report_with_professional(text, date, date, jsonb)', 'EXECUTE') as auth_share_exec,
        has_function_privilege('service_role', 'public.share_report_with_professional(text, date, date, jsonb)', 'EXECUTE') as service_share_exec,
        has_function_privilege('anon', 'public.lookup_professional_by_share_code(text)', 'EXECUTE') as anon_lookup_exec,
        has_function_privilege('authenticated', 'public.lookup_professional_by_share_code(text)', 'EXECUTE') as auth_lookup_exec,
        has_function_privilege('authenticated', 'public.list_patient_share_recipients()', 'EXECUTE') as auth_list_exec,
        has_function_privilege('anon', 'public.list_patient_share_recipients()', 'EXECUTE') as anon_list_exec,
        has_table_privilege('authenticated', 'public.intake_entries', 'INSERT') as auth_intake_insert
    ) t
    `,
  );

  const { child, getLogs } = startPostgrest(postgrestBin);
  const checks = [];
  try {
    await waitUntilReady(getLogs);
    checks.push([
      "historical rows survive S1 and S2",
      before.contacts === 2 &&
        before.shares === 2 &&
        after.contacts === 2 &&
        after.shares === 2,
    ]);
    checks.push([
      "PostgREST privileges match the suspension",
      privileges.auth_contact_select === true &&
        privileges.auth_contact_insert === false &&
        privileges.auth_contact_update === false &&
        privileges.auth_contact_delete === true &&
        privileges.anon_contact_insert === false &&
        privileges.anon_contact_truncate === false &&
        privileges.service_contact_insert === false &&
        privileges.service_contact_delete === true &&
        privileges.auth_share_insert === false &&
        privileges.auth_share_delete === true &&
        privileges.service_share_insert === false &&
        privileges.service_share_delete === true &&
        privileges.public_share_exec === false &&
        privileges.anon_share_exec === false &&
        privileges.auth_share_exec === false &&
        privileges.service_share_exec === false &&
        privileges.anon_lookup_exec === false &&
        privileges.auth_lookup_exec === false &&
        privileges.auth_list_exec === true &&
        privileges.anon_list_exec === false &&
        privileges.auth_intake_insert === true,
    ]);

    const anonInsert = await api("POST", "/patient_professional_contacts", {
      prefer: "return=representation",
      body: {
        patient_user_id: PATIENT,
        professional_user_id: STRANGER,
        label: "nutricion",
      },
    });
    checks.push(["anon cannot insert a contact", denied(anonInsert)]);

    const authInsert = await api("POST", "/patient_professional_contacts", {
      bearer: token("authenticated", PATIENT),
      prefer: "return=representation",
      body: {
        patient_user_id: PATIENT,
        professional_user_id: STRANGER,
        label: "nutricion",
      },
    });
    checks.push(["authenticated cannot insert a contact", denied(authInsert)]);

    const authShare = await api("POST", "/professional_report_shares", {
      bearer: token("authenticated", PATIENT),
      prefer: "return=representation",
      body: {
        professional_user_id: PROFESSIONAL,
        patient_user_id: PATIENT,
        range_from: "2026-03-01",
        range_to: "2026-03-07",
        snapshot: { source: "blocked" },
      },
    });
    checks.push(["authenticated cannot insert a share", denied(authShare)]);

    const serviceShare = await api("POST", "/rpc/share_report_with_professional", {
      bearer: token("service_role", PATIENT),
      body: {
        share_code: "AAAAAA",
        range_from: "2026-03-01",
        range_to: "2026-03-07",
        snapshot: { source: "blocked" },
      },
    });
    const authRpc = await api("POST", "/rpc/share_report_with_professional", {
      bearer: token("authenticated", PATIENT),
      body: {
        share_code: "AAAAAA",
        range_from: "2026-03-01",
        range_to: "2026-03-07",
        snapshot: {},
      },
    });
    const anonRpc = await api("POST", "/rpc/share_report_with_professional", {
      body: {
        share_code: "AAAAAA",
        range_from: "2026-03-01",
        range_to: "2026-03-07",
        snapshot: {},
      },
    });
    checks.push([
      "share_report_with_professional is closed for anon, authenticated, and service_role",
      denied(serviceShare) && denied(authRpc) && denied(anonRpc),
    ]);

    const lookup = await api("POST", "/rpc/lookup_professional_by_share_code", {
      bearer: token("authenticated", PATIENT),
      body: { share_code: "AAAAAA" },
    });
    checks.push(["lookup_professional_by_share_code is closed", denied(lookup)]);

    const ownList = await api("POST", "/rpc/list_patient_share_recipients", {
      bearer: token("authenticated", PATIENT),
      body: {},
    });
    const otherList = await api("POST", "/rpc/list_patient_share_recipients", {
      bearer: token("authenticated", OTHER),
      body: {},
    });
    checks.push([
      "list_patient_share_recipients returns only the caller",
      ownList.status === 200 &&
        Array.isArray(ownList.json) &&
        ownList.json.length === 1 &&
        ownList.json[0].professional_user_id === PROFESSIONAL &&
        otherList.status === 200 &&
        Array.isArray(otherList.json) &&
        otherList.json.length === 0,
    ]);

    const ownContacts = await api(
      "GET",
      `/patient_professional_contacts?patient_user_id=eq.${PATIENT}&select=label`,
      { bearer: token("authenticated", PATIENT) },
    );
    const otherContacts = await api(
      "GET",
      `/patient_professional_contacts?patient_user_id=eq.${PATIENT}&select=label`,
      { bearer: token("authenticated", OTHER) },
    );
    checks.push([
      "patient can read own contacts and another user cannot",
      ownContacts.status === 200 &&
        ownContacts.json.length === 1 &&
        ownContacts.json[0].label === "endocrinologia" &&
        otherContacts.status === 200 &&
        otherContacts.json.length === 0,
    ]);

    const professionalShares = await api(
      "GET",
      `/professional_report_shares?professional_user_id=eq.${PROFESSIONAL}&select=snapshot`,
      { bearer: token("authenticated", PROFESSIONAL) },
    );
    checks.push([
      "professional can still read shares sent to them",
      professionalShares.status === 200 && professionalShares.json.length === 2,
    ]);

    const otherDelete = await api(
      "DELETE",
      `/professional_report_shares?patient_user_id=eq.${PATIENT}`,
      { bearer: token("authenticated", OTHER) },
    );
    const stillThere = queryJson(
      DB,
      `select json_build_object('n', count(*)) from public.professional_report_shares where patient_user_id = '${PATIENT}'`,
    );
    checks.push([
      "another user cannot revoke the patient's shares",
      (otherDelete.status === 204 || otherDelete.status === 200) && stillThere.n === 1,
    ]);

    const patientDelete = await api(
      "DELETE",
      `/professional_report_shares?patient_user_id=eq.${DELETE_ME}`,
      { bearer: token("authenticated", DELETE_ME) },
    );
    const deletedShares = queryJson(
      DB,
      `select json_build_object('n', count(*)) from public.professional_report_shares where patient_user_id = '${DELETE_ME}'`,
    );
    checks.push([
      "the patient can revoke own shares",
      (patientDelete.status === 204 || patientDelete.status === 200) &&
        deletedShares.n === 0,
    ]);

    const serviceDelete = await api(
      "DELETE",
      `/patient_professional_contacts?patient_user_id=eq.${DELETE_ME}`,
      { bearer: token("service_role", DELETE_ME) },
    );
    const deletedContact = queryJson(
      DB,
      `select json_build_object('n', count(*)) from public.patient_professional_contacts where patient_user_id = '${DELETE_ME}'`,
    );
    const kept = queryJson(
      DB,
      `select json_build_object('n', count(*)) from public.patient_professional_contacts where patient_user_id = '${PATIENT}'`,
    );
    checks.push([
      "service_role can delete one fictional account and the other contact remains",
      (serviceDelete.status === 204 || serviceDelete.status === 200) &&
        deletedContact.n === 0 &&
        kept.n === 1,
    ]);

    const shareCount = queryJson(
      DB,
      `select json_build_object('n', count(*)) from public.professional_report_shares where snapshot->>'source' = 'blocked'`,
    );
    checks.push(["no blocked share was stored", shareCount.n === 0]);

    const s3File = path.join(repoMigrations, s3Name);
    if (fs.existsSync(s3File)) {
      const beforeS3 = queryJson(
        DB,
        `select json_build_object('n', count(*)) from public.professional_report_shares`,
      );
      const applied = psql(DB, "", ["-f", s3File]);
      if (applied.status !== 0) {
        throw new Error(
          `S3 migration failed: ${(applied.stderr || applied.stdout || "").split("\n")[0]}`,
        );
      }
      const afterS3 = queryJson(
        DB,
        `select json_build_object('n', count(*)) from public.professional_report_shares`,
      );
      const patientShares = await api(
        "GET",
        `/professional_report_shares?patient_user_id=eq.${PATIENT}&select=id`,
        { bearer: token("authenticated", PATIENT) },
      );
      const professionalSharesAfter = await api(
        "GET",
        `/professional_report_shares?professional_user_id=eq.${PROFESSIONAL}&select=id`,
        { bearer: token("authenticated", PROFESSIONAL) },
      );
      checks.push([
        "S3 keeps the patient's historical shares and closes the professional read",
        beforeS3.n === afterS3.n &&
          patientShares.status === 200 &&
          patientShares.json.length === 1 &&
          professionalSharesAfter.status === 200 &&
          professionalSharesAfter.json.length === 0,
      ]);
    }
  } finally {
    child.kill();
  }

  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  const report = {
    kind: "postgres-postgrest",
    postgresVersion,
    postgrestVersion,
    headAtRun,
    expectedCommit: process.env.S2_EXPECT_COMMIT || null,
    migrationSha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(migrationFile))
      .digest("hex"),
    migrationNotes,
    privileges,
    checks,
    passed: failed.length === 0,
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      { passed: report.passed, failed, postgres: postgresVersion, postgrest: postgrestVersion },
      null,
      2,
    ),
  );
  return report.passed ? 0 : 1;
}

async function run() {
  let code = 1;
  try {
    code = await main();
  } catch (error) {
    console.error(error.message || error);
    code = 1;
  } finally {
    try {
      execSql(
        "postgres",
        `
        select pg_terminate_backend(pid)
        from pg_stat_activity
        where datname = '${DB}' and pid <> pg_backend_pid();
        drop database if exists ${DB};
        drop role if exists authenticator;
        drop role if exists anon;
        drop role if exists authenticated;
        drop role if exists service_role;
        `,
      );
    } catch (error) {
      console.error(`cleanup: ${error.message || error}`);
    }
  }
  process.exit(code);
}

run();
