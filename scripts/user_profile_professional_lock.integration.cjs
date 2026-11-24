const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync, spawn, spawnSync } = require("child_process");

// Real PostgreSQL + real PostgREST, on localhost only.
// Creates and drops a database named migajas_s1_lock. Refuses any host other
// than 127.0.0.1 or localhost, and refuses a URL that points at Supabase.
// Does not read or write the production project.
const repoRoot = path.resolve(__dirname, "..");
const repoMigrations = path.join(repoRoot, "supabase", "migrations");
const lockName = "20261124120000_lock_user_profile_professional_columns.sql";
const lockFile = path.join(repoMigrations, lockName);
const reportFile = path.join(
  __dirname,
  "user_profile_professional_lock.integration.result.json",
);
const DB = "migajas_s1_lock";
const JWT_SECRET = "s1-local-jwt-secret-not-for-production-use";
const AUTH_PASSWORD = "s1-local-only";
const PORT = Number(process.env.S1_POSTGREST_PORT || 54321);

const PATIENT = "11111111-1111-4111-8111-111111111111";
const PROFESSIONAL = "22222222-2222-4222-8222-222222222222";
const ONBOARD = "33333333-3333-4333-8333-333333333333";

const KNOWN_REPLAY_GAPS = new Set([
  "20260713160000_seed_content.sql",
  "20260714160300_lock_admin_rpc.sql",
]);

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
  const result = spawnSync(args[0], [...args.slice(1), ...extraArgs], {
    input: sql,
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      PGPASSWORD: process.env.PGPASSWORD,
      PGUSER: process.env.PGUSER,
    },
  });
  if (result.error) {
    throw result.error;
  }
  return result;
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

function locked(response) {
  const message = String(response.json?.message || "");
  return (
    (response.status === 401 || response.status === 403) &&
    response.json?.code === "42501" &&
    message.includes("professional profile columns are locked")
  );
}

function readProfile(userId) {
  return queryJson(
    DB,
    `
    select row_to_json(t)
    from (
      select region_id,
             daily_carb_goal_g,
             clinical_mode_enabled,
             is_professional,
             professional_role,
             professional_share_code
      from public.user_profiles
      where user_id = '${userId}'
    ) t
    `,
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
    if (/error|FATAL/i.test(getLogs()) && /Listening/.test(getLogs()) === false) {
      // Keep waiting until the deadline unless the process already exited.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`PostgREST did not listen on ${PORT}:\n${getLogs()}`);
}

function applyMigrations() {
  const notes = [];
  const files = fs
    .readdirSync(repoMigrations)
    .filter((name) => name.endsWith(".sql") && name !== lockName)
    .sort();
  for (const name of files) {
    const result = psql(DB, "", ["-f", path.join(repoMigrations, name)]);
    // psql -f ignores stdin. Passing "" is fine.
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
  if (process.env.S1_EXPECT_COMMIT && process.env.S1_EXPECT_COMMIT !== headAtRun) {
    throw new Error(
      `integration HEAD ${headAtRun} does not match S1_EXPECT_COMMIT ${process.env.S1_EXPECT_COMMIT}`,
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
      ('${ONBOARD}', 'onboard@example.test');
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled,
      is_professional, professional_role, professional_share_code
    ) values
      ('${PATIENT}', 'es', 150, false, false, null, null),
      ('${PROFESSIONAL}', 'es', 200, true, true, 'endocrinologia', 'AAAAAA');
    `,
  );
  const before = queryJson(
    DB,
    "select json_agg(t order by t.user_id) from (select user_id::text, region_id, daily_carb_goal_g, clinical_mode_enabled, is_professional, professional_role, professional_share_code from public.user_profiles) t",
  );
  const lockResult = psql(DB, "", ["-f", lockFile]);
  if (lockResult.status !== 0) {
    throw new Error((lockResult.stderr || lockResult.stdout).trim());
  }
  const after = queryJson(
    DB,
    "select json_agg(t order by t.user_id) from (select user_id::text, region_id, daily_carb_goal_g, clinical_mode_enabled, is_professional, professional_role, professional_share_code from public.user_profiles) t",
  );

  execSql(
    DB,
    `
    create function public.s1_session_probe()
    returns jsonb language sql stable as $$
      select jsonb_build_object(
        'current_user', current_user,
        'jwt_role', auth.role(),
        'uid', auth.uid()
      );
    $$;
    grant execute on function public.s1_session_probe() to anon, authenticated, service_role;
    `,
  );

  const privileges = queryJson(
    DB,
    `
    select row_to_json(t) from (
      select
        has_table_privilege('anon', 'public.user_profiles', 'INSERT') as anon_insert,
        has_table_privilege('anon', 'public.user_profiles', 'TRUNCATE') as anon_truncate,
        has_table_privilege('authenticated', 'public.user_profiles', 'SELECT') as authenticated_select,
        has_table_privilege('authenticated', 'public.user_profiles', 'INSERT') as authenticated_insert,
        has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE') as authenticated_update,
        has_table_privilege('authenticated', 'public.user_profiles', 'DELETE') as authenticated_delete,
        has_table_privilege('service_role', 'public.user_profiles', 'UPDATE') as service_update,
        has_table_privilege('service_role', 'public.user_profiles', 'DELETE') as service_delete
    ) t
    `,
  );

  const { child, getLogs } = startPostgrest(postgrestBin);
  const checks = [];
  let probes = null;
  try {
    await waitUntilReady(getLogs);
    const anonProbe = await api("GET", "/rpc/s1_session_probe");
    const authProbe = await api("GET", "/rpc/s1_session_probe", {
      bearer: token("authenticated", ONBOARD),
    });
    const serviceProbe = await api("GET", "/rpc/s1_session_probe", {
      bearer: token("service_role", PATIENT),
    });
    probes = {
      anon: { status: anonProbe.status, body: anonProbe.json },
      authenticated: { status: authProbe.status, body: authProbe.json },
      service_role: { status: serviceProbe.status, body: serviceProbe.json },
    };
    checks.push([
      "PostgREST maps anon, authenticated, and service_role onto current_user and auth.role()",
      anonProbe.json?.current_user === "anon" &&
        anonProbe.json?.jwt_role === "anon" &&
        authProbe.json?.current_user === "authenticated" &&
        authProbe.json?.jwt_role === "authenticated" &&
        authProbe.json?.uid === ONBOARD &&
        serviceProbe.json?.current_user === "service_role" &&
        serviceProbe.json?.jwt_role === "service_role",
    ]);

    const anonInsert = await api("POST", "/user_profiles", {
      body: { user_id: ONBOARD, region_id: "es" },
      prefer: "return=representation",
    });
    checks.push([
      "anon cannot insert a profile",
      anonInsert.status === 401 || anonInsert.status === 403,
    ]);

    const onboard = await api("POST", "/user_profiles", {
      bearer: token("authenticated", ONBOARD),
      prefer: "return=representation",
      body: {
        user_id: ONBOARD,
        region_id: "do",
        daily_carb_goal_g: 180,
        clinical_mode_enabled: false,
      },
    });
    const onboarded = readProfile(ONBOARD);
    checks.push([
      "authenticated onboarding insert stores default professional columns",
      onboard.status === 201 &&
        onboarded.region_id === "do" &&
        onboarded.is_professional === false &&
        onboarded.professional_role === null &&
        onboarded.professional_share_code === null,
    ]);

    const region = await api(
      "PATCH",
      `/user_profiles?user_id=eq.${ONBOARD}`,
      {
        bearer: token("authenticated", ONBOARD),
        prefer: "return=representation",
        body: {
          region_id: "es",
          daily_carb_goal_g: 160,
          clinical_mode_enabled: true,
          is_professional: false,
          professional_role: null,
          professional_share_code: null,
        },
      },
    );
    const afterRegion = readProfile(ONBOARD);
    checks.push([
      "authenticated can change region, goal, and clinical mode through PostgREST",
      region.status === 200 &&
        afterRegion.region_id === "es" &&
        afterRegion.daily_carb_goal_g === 160 &&
        afterRegion.clinical_mode_enabled === true &&
        afterRegion.is_professional === false,
    ]);

    const keep = await api(
      "PATCH",
      `/user_profiles?user_id=eq.${PROFESSIONAL}`,
      {
        bearer: token("authenticated", PROFESSIONAL),
        prefer: "return=representation",
        body: {
          region_id: "do",
          is_professional: true,
          professional_role: "endocrinologia",
          professional_share_code: "AAAAAA",
        },
      },
    );
    const kept = readProfile(PROFESSIONAL);
    checks.push([
      "existing professional keeps the share code when the same values are resent",
      keep.status === 200 &&
        kept.region_id === "do" &&
        kept.is_professional === true &&
        kept.professional_role === "endocrinologia" &&
        kept.professional_share_code === "AAAAAA",
    ]);

    const elevate = await api(
      "PATCH",
      `/user_profiles?user_id=eq.${PATIENT}`,
      {
        bearer: token("authenticated", PATIENT),
        prefer: "return=representation",
        body: {
          region_id: "do",
          is_professional: true,
          professional_role: "nutricion",
          professional_share_code: "CCCCCC",
        },
      },
    );
    const patient = readProfile(PATIENT);
    checks.push([
      "authenticated self-assignment through PostgREST changes nothing",
      locked(elevate) &&
        patient.region_id === "es" &&
        patient.is_professional === false &&
        patient.professional_share_code === null,
    ]);

    const serviceWrite = await api(
      "PATCH",
      `/user_profiles?user_id=eq.${PATIENT}`,
      {
        bearer: token("service_role", PATIENT),
        prefer: "return=representation",
        body: {
          is_professional: true,
          professional_role: "nutricion",
          professional_share_code: "CCCCCC",
        },
      },
    );
    const elevated = readProfile(PATIENT);
    const serviceRestore = await api(
      "PATCH",
      `/user_profiles?user_id=eq.${PATIENT}`,
      {
        bearer: token("service_role", PATIENT),
        prefer: "return=representation",
        body: {
          is_professional: false,
          professional_role: null,
          professional_share_code: null,
        },
      },
    );
    const restored = readProfile(PATIENT);
    checks.push([
      "service_role JWT through PostgREST can change and restore professional columns",
      serviceWrite.status === 200 &&
        elevated.is_professional === true &&
        elevated.professional_share_code === "CCCCCC" &&
        serviceRestore.status === 200 &&
        restored.is_professional === false &&
        restored.professional_share_code === null &&
        restored.region_id === "es",
    ]);
  } finally {
    child.kill("SIGTERM");
  }

  let postgresError = null;
  try {
    execSql(
      DB,
      `
      select set_config('request.jwt.claim.role', 'service_role', false);
      select set_config('request.jwt.claims', '{"role":"service_role"}', false);
      update public.user_profiles
      set is_professional = true
      where user_id = '${PATIENT}';
      `,
    );
  } catch (error) {
    postgresError = String(error.message || error);
  }
  const afterAdmin = readProfile(PATIENT);
  const adminRegion = execSql(
    DB,
    `
    reset role;
    select set_config('request.jwt.claim.role', '', false);
    select set_config('request.jwt.claims', '', false);
    update public.user_profiles
    set region_id = 'es'
    where user_id = '${PROFESSIONAL}';
    `,
  );
  const professionalFinal = readProfile(PROFESSIONAL);
  checks.push([
    "postgres with a service_role JWT still cannot change professional columns, and can change region",
    postgresError?.includes("professional profile columns are locked") &&
      afterAdmin.is_professional === false &&
      adminRegion !== null &&
      professionalFinal.region_id === "es" &&
      professionalFinal.professional_share_code === "AAAAAA",
  ]);
  checks.push([
    "migration does not change the fictional rows that already existed",
    JSON.stringify(before) === JSON.stringify(after),
  ]);
  checks.push([
    "grants after the migration match the narrow authenticated set",
    privileges.anon_insert === false &&
      privileges.anon_truncate === false &&
      privileges.authenticated_select === true &&
      privileges.authenticated_insert === true &&
      privileges.authenticated_update === true &&
      privileges.authenticated_delete === false &&
      privileges.service_update === true &&
      privileges.service_delete === true,
  ]);

  const report = {
    validation: {
      engine: "PostgreSQL+PostgREST",
      host: "127.0.0.1",
      database: DB,
      databaseDroppedAfterRun: true,
      production: "not used",
      hostedSupabase: "not used",
      note: "Isolated local engines with fictional users. This is not the production project and not a paid Supabase project. auth.role() is the Supabase expression, installed in this empty database.",
    },
    postgresVersion,
    postgrestVersion,
    headAtRun,
    expectedCommit: process.env.S1_EXPECT_COMMIT || null,
    migrationSha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(lockFile))
      .digest("hex"),
    migrationNotes,
    probes,
    checks,
    passed: checks.every(([, ok]) => ok),
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        failed,
        postgres: postgresVersion,
        postgrest: postgrestVersion,
      },
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
