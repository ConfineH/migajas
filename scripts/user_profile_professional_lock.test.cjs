const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { PGlite } = require("@electric-sql/pglite");

// Preliminary lock check on an in-memory database.
// Does not open a network connection, does not start PostgREST, and does not
// read production data. Passing here is not a production verification.
// GitHub Actions runs this file on the checked-out commit. Set
// S1_EXPECT_COMMIT to that SHA and the run fails if HEAD is different.
const repoRoot = path.resolve(__dirname, "..");
const pgliteVersion = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "node_modules/@electric-sql/pglite/package.json"),
    "utf8",
  ),
).version;
const repoMigrations = path.join(repoRoot, "supabase", "migrations");
const lockName = "20261124120000_lock_user_profile_professional_columns.sql";
const lockFile = path.join(repoMigrations, lockName);
const recoveryFile = path.join(
  repoRoot,
  "supabase/recovery/s1_reassert_user_profile_professional_lock.sql",
);
const routeFile = path.join(
  repoRoot,
  "src/app/api/professional/activate/route.ts",
);
const reportFile = path.join(
  __dirname,
  "user_profile_professional_lock.result.json",
);

const PATIENT = "11111111-1111-4111-8111-111111111111";
const PROFESSIONAL = "22222222-2222-4222-8222-222222222222";
const ONBOARD = "33333333-3333-4333-8333-333333333333";
const GAP = "44444444-4444-4444-8444-444444444444";
const DELETE_ME = "55555555-5555-4555-8555-555555555555";

const KNOWN_REPLAY_GAPS = new Set([
  "20260713160000_seed_content.sql",
  "20260714160300_lock_admin_rpc.sql",
]);

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function shortError(error) {
  return {
    ok: false,
    code: error.code || null,
    message: String(error.message || error).split("\n")[0],
  };
}

function lockSection(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(
    /-- LOCK STATEMENTS BEGIN\n([\s\S]*?)\n-- LOCK STATEMENTS END/,
  );
  if (!match) {
    throw new Error(`missing lock markers in ${file}`);
  }
  return match[1];
}

function assertNoDataChange(sql) {
  const stripped = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  if (
    /\b(insert\s+into|update\s+public\.|delete\s+from|truncate\s+)/i.test(
      stripped,
    )
  ) {
    throw new Error("lock SQL contains a data-changing statement");
  }
}

async function run(db, sql) {
  try {
    const result = await db.query(sql);
    return {
      ok: true,
      code: null,
      message: null,
      rows: result.rows,
    };
  } catch (error) {
    return { ...shortError(error), rows: [] };
  }
}

async function setSession(db, { role = null, userId = null, jwtRole, claimsRole } = {}) {
  await db.exec("reset role");
  await db.exec(
    `select set_config('request.jwt.claim.sub', ${sqlString(userId ?? "")}, false)`,
  );
  await db.exec(
    `select set_config('request.jwt.claim.role', ${sqlString(jwtRole ?? "")}, false)`,
  );
  const claims =
    jwtRole === undefined && claimsRole === undefined
      ? ""
      : JSON.stringify({
          sub: userId ?? "",
          role: claimsRole !== undefined ? claimsRole : jwtRole,
        });
  await db.exec(
    `select set_config('request.jwt.claims', ${sqlString(claims)}, false)`,
  );
  if (role) {
    await db.exec(`set role ${role}`);
  }
}

async function identity(db) {
  return run(
    db,
    `
    select current_user,
           session_user,
           auth.role() as jwt_role,
           auth.uid()::text as uid,
           (select rolbypassrls from pg_roles where rolname = current_user) as bypass
    `,
  );
}

async function readProfile(db, userId) {
  await setSession(db, {});
  const result = await run(
    db,
    `
    select region_id,
           daily_carb_goal_g,
           clinical_mode_enabled,
           is_professional,
           professional_role,
           professional_share_code
    from public.user_profiles
    where user_id = ${sqlString(userId)}
    `,
  );
  return result.ok ? result.rows[0] ?? null : result;
}

function locked(result) {
  return (
    result.ok === false &&
    result.code === "42501" &&
    String(result.message).includes("professional profile columns are locked")
  );
}

function sameProfessionalAttrs(row, expected) {
  return (
    row &&
    row.is_professional === expected.is_professional &&
    row.professional_role === expected.professional_role &&
    row.professional_share_code === expected.professional_share_code
  );
}

async function authenticatedCannotAssumeServiceRole() {
  // Separate database: PGlite does not restore the original superuser with
  // RESET SESSION AUTHORIZATION, so this check must not run inside the
  // database that still has the profile fixture.
  const isolated = new PGlite();
  await isolated.exec(`
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
  `);
  const membership = await isolated.query(
    "select pg_has_role('authenticated', 'service_role', 'member') as member",
  );
  await isolated.exec("set session authorization authenticated");
  let error = null;
  try {
    await isolated.exec("set role service_role");
  } catch (caught) {
    error = shortError(caught);
  }
  const who = await isolated.query("select current_user, session_user");
  await isolated.close();
  return {
    member: membership.rows[0]?.member,
    error,
    current_user: who.rows[0]?.current_user,
    session_user: who.rows[0]?.session_user,
  };
}

async function privilegeProbe(db) {
  await setSession(db, {});
  return run(
    db,
    `
    select
      has_table_privilege('anon', 'public.user_profiles', 'SELECT') as anon_select,
      has_table_privilege('anon', 'public.user_profiles', 'INSERT') as anon_insert,
      has_table_privilege('anon', 'public.user_profiles', 'UPDATE') as anon_update,
      has_table_privilege('anon', 'public.user_profiles', 'DELETE') as anon_delete,
      has_table_privilege('anon', 'public.user_profiles', 'TRUNCATE') as anon_truncate,
      has_table_privilege('authenticated', 'public.user_profiles', 'SELECT') as authenticated_select,
      has_table_privilege('authenticated', 'public.user_profiles', 'INSERT') as authenticated_insert,
      has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE') as authenticated_update,
      has_table_privilege('authenticated', 'public.user_profiles', 'DELETE') as authenticated_delete,
      has_table_privilege('authenticated', 'public.user_profiles', 'TRUNCATE') as authenticated_truncate,
      has_table_privilege('service_role', 'public.user_profiles', 'SELECT') as service_select,
      has_table_privilege('service_role', 'public.user_profiles', 'INSERT') as service_insert,
      has_table_privilege('service_role', 'public.user_profiles', 'UPDATE') as service_update,
      has_table_privilege('service_role', 'public.user_profiles', 'DELETE') as service_delete,
      has_table_privilege('service_role', 'public.user_profiles', 'TRUNCATE') as service_truncate,
      (
        select c.relacl::text
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'user_profiles'
      ) as relacl
    `,
  );
}

async function main() {
  const declaredPglite = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  ).devDependencies["@electric-sql/pglite"];
  if (declaredPglite !== "0.5.16" || pgliteVersion !== "0.5.16") {
    throw new Error(
      `@electric-sql/pglite must be pinned to 0.5.16, package.json=${declaredPglite}, installed=${pgliteVersion}`,
    );
  }
  const headAtRun = execSync("git rev-parse HEAD", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (process.env.S1_EXPECT_COMMIT && process.env.S1_EXPECT_COMMIT !== headAtRun) {
    throw new Error(
      `S1 test HEAD ${headAtRun} does not match S1_EXPECT_COMMIT ${process.env.S1_EXPECT_COMMIT}`,
    );
  }
  const migrationLock = lockSection(lockFile);
  const recoveryLock = lockSection(recoveryFile);
  if (migrationLock !== recoveryLock) {
    throw new Error("recovery SQL drifted from the migration lock");
  }
  assertNoDataChange(migrationLock);

  const routeSource = fs.readFileSync(routeFile, "utf8");
  if (
    /patchUserProfile|upsertUserProfile|is_professional|createClient|service_role/.test(
      routeSource,
    )
  ) {
    throw new Error("activate route still has a profile write path");
  }
  if (!routeSource.includes("status: 403")) {
    throw new Error("activate route does not return 403");
  }

  const db = new PGlite();
  const version = await db.query("select version()");
  const checks = [];
  const migrationNotes = [];

  await db.exec(`
    create role anon nologin nosuperuser nobypassrls;
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
    create schema if not exists auth;
    grant usage on schema auth to public, anon, authenticated, service_role;
    create table if not exists auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create or replace function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    create or replace function auth.role()
    returns text
    language sql
    stable
    as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.role', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
      )::text;
    $$;
    grant execute on function auth.uid() to public, anon, authenticated, service_role;
    grant execute on function auth.role() to public, anon, authenticated, service_role;
  `);

  const files = fs
    .readdirSync(repoMigrations)
    .filter((name) => name.endsWith(".sql") && name !== lockName)
    .sort();

  for (const name of files) {
    const sql = fs.readFileSync(path.join(repoMigrations, name), "utf8");
    try {
      await db.exec(sql);
      console.log(`migration ok ${name}`);
    } catch (error) {
      const failure = shortError(error);
      if (KNOWN_REPLAY_GAPS.has(name)) {
        migrationNotes.push({ file: name, applied: false, ...failure });
        console.log(`migration skipped ${name}: ${failure.message}`);
        continue;
      }
      console.error(`migration failed ${name}`);
      console.error(failure.message);
      process.exit(1);
    }
  }

  const session = await identity(db);
  if (!session.ok || session.rows[0].current_user !== "postgres") {
    console.error("administrative session is not postgres", session);
    process.exit(1);
  }

  const afterHistory = await privilegeProbe(db);
  await db.exec(`
    grant all privileges on table public.user_profiles
      to anon, authenticated, service_role;
  `);
  const beforeLock = await privilegeProbe(db);

  await db.exec(`
    insert into auth.users (id, email) values
      (${sqlString(PATIENT)}, 'patient@example.test'),
      (${sqlString(PROFESSIONAL)}, 'professional@example.test'),
      (${sqlString(ONBOARD)}, 'onboard@example.test'),
      (${sqlString(GAP)}, 'gap@example.test'),
      (${sqlString(DELETE_ME)}, 'delete-me@example.test');
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled,
      is_professional, professional_role, professional_share_code
    ) values
      (${sqlString(PATIENT)}, 'es', 150, false, false, null, null),
      (${sqlString(PROFESSIONAL)}, 'es', 200, true, true, 'endocrinologia', 'AAAAAA');
  `);

  const beforeRows = await run(
    db,
    `
    select user_id::text,
           region_id,
           daily_carb_goal_g,
           clinical_mode_enabled,
           is_professional,
           professional_role,
           professional_share_code
    from public.user_profiles
    order by user_id
    `,
  );
  const beforeCount = beforeRows.rows.length;

  await db.exec(fs.readFileSync(lockFile, "utf8"));

  const afterRows = await run(
    db,
    `
    select user_id::text,
           region_id,
           daily_carb_goal_g,
           clinical_mode_enabled,
           is_professional,
           professional_role,
           professional_share_code
    from public.user_profiles
    order by user_id
    `,
  );
  const afterLock = await privilegeProbe(db);
  const triggerDef = await run(
    db,
    `
    select p.prosecdef as security_definer,
           p.proconfig::text as config
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'protect_user_profile_professional_columns'
    `,
  );
  const definerWriters = await run(
    db,
    `
    select p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and pg_get_functiondef(p.oid) ~* 'insert[[:space:]]+into[[:space:]]+public\\.user_profiles|update[[:space:]]+public\\.user_profiles'
    `,
  );

  checks.push([
    "migration does not change existing rows",
    beforeCount === 2 &&
      afterRows.rows.length === 2 &&
      JSON.stringify(beforeRows.rows) === JSON.stringify(afterRows.rows),
  ]);
  checks.push([
    "trigger is invoker and pins search_path",
    triggerDef.rows[0]?.security_definer === false &&
      String(triggerDef.rows[0]?.config || "").includes("search_path="),
  ]);
  checks.push([
    "no security definer function writes user_profiles",
    definerWriters.ok === true && definerWriters.rows.length === 0,
  ]);

  const privileges = afterLock.rows[0];
  checks.push([
    "anon loses every table privilege",
    privileges.anon_select === false &&
      privileges.anon_insert === false &&
      privileges.anon_update === false &&
      privileges.anon_delete === false &&
      privileges.anon_truncate === false,
  ]);
  checks.push([
    "authenticated keeps select, insert, and update only",
    privileges.authenticated_select === true &&
      privileges.authenticated_insert === true &&
      privileges.authenticated_update === true &&
      privileges.authenticated_delete === false &&
      privileges.authenticated_truncate === false,
  ]);
  checks.push([
    "service_role keeps delete and truncate",
    privileges.service_select === true &&
      privileges.service_insert === true &&
      privileges.service_update === true &&
      privileges.service_delete === true &&
      privileges.service_truncate === true,
  ]);

  await setSession(db, { role: "anon", jwtRole: "anon" });
  const anonWrite = await run(
    db,
    `
    insert into public.user_profiles (user_id, region_id)
    values (${sqlString(ONBOARD)}, 'es')
    `,
  );
  const anonTruncate = await run(db, "truncate public.user_profiles");
  checks.push([
    "anon cannot insert or truncate",
    anonWrite.ok === false &&
      anonWrite.code === "42501" &&
      !String(anonWrite.message).includes("professional profile columns are locked") &&
      anonTruncate.ok === false &&
      anonTruncate.code === "42501",
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: ONBOARD,
    jwtRole: "authenticated",
  });
  const onboarding = await run(
    db,
    `
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, updated_at
    ) values (
      ${sqlString(ONBOARD)}, 'do', 180, false, now()
    )
    returning region_id, daily_carb_goal_g, is_professional, professional_role, professional_share_code
    `,
  );
  const onboarded = await readProfile(db, ONBOARD);
  checks.push([
    "onboarding insert omits professional columns and stores defaults",
    onboarding.ok === true &&
      onboarded.region_id === "do" &&
      onboarded.daily_carb_goal_g === 180 &&
      onboarded.is_professional === false &&
      onboarded.professional_role === null &&
      onboarded.professional_share_code === null,
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: ONBOARD,
    jwtRole: "authenticated",
  });
  const regionUpdate = await run(
    db,
    `
    update public.user_profiles
    set region_id = 'es',
        daily_carb_goal_g = 160,
        clinical_mode_enabled = true,
        is_professional = false,
        professional_role = null,
        professional_share_code = null,
        updated_at = now()
    where user_id = ${sqlString(ONBOARD)}
    returning region_id, daily_carb_goal_g, clinical_mode_enabled
    `,
  );
  const afterRegion = await readProfile(db, ONBOARD);
  checks.push([
    "profile update can change region, goal, and clinical mode",
    regionUpdate.ok === true &&
      afterRegion.region_id === "es" &&
      afterRegion.daily_carb_goal_g === 160 &&
      afterRegion.clinical_mode_enabled === true &&
      afterRegion.is_professional === false &&
      afterRegion.professional_role === null &&
      afterRegion.professional_share_code === null,
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: PROFESSIONAL,
    jwtRole: "authenticated",
  });
  const keepProfessional = await run(
    db,
    `
    update public.user_profiles
    set region_id = 'do',
        daily_carb_goal_g = 180,
        clinical_mode_enabled = false,
        is_professional = true,
        professional_role = 'endocrinologia',
        professional_share_code = 'AAAAAA',
        updated_at = now()
    where user_id = ${sqlString(PROFESSIONAL)}
    returning region_id, is_professional, professional_role, professional_share_code
    `,
  );
  const kept = await readProfile(db, PROFESSIONAL);
  checks.push([
    "existing professional can change region while the same professional attributes are resent",
    keepProfessional.ok === true &&
      kept.region_id === "do" &&
      kept.daily_carb_goal_g === 180 &&
      kept.clinical_mode_enabled === false &&
      sameProfessionalAttrs(kept, {
        is_professional: true,
        professional_role: "endocrinologia",
        professional_share_code: "AAAAAA",
      }),
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: PROFESSIONAL,
    jwtRole: "authenticated",
  });
  const retarget = await run(
    db,
    `
    update public.user_profiles
    set professional_share_code = 'BBBBBB'
    where user_id = ${sqlString(PROFESSIONAL)}
    returning professional_share_code
    `,
  );
  const afterRetarget = await readProfile(db, PROFESSIONAL);
  checks.push([
    "existing professional cannot change the share code",
    locked(retarget) &&
      afterRetarget.region_id === "do" &&
      sameProfessionalAttrs(afterRetarget, {
        is_professional: true,
        professional_role: "endocrinologia",
        professional_share_code: "AAAAAA",
      }),
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: PATIENT,
    jwtRole: "authenticated",
  });
  const selfAssign = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true,
        professional_role = 'nutricion',
        professional_share_code = 'CCCCCC',
        region_id = 'do'
    where user_id = ${sqlString(PATIENT)}
    returning is_professional, region_id
    `,
  );
  const patientAfter = await readProfile(db, PATIENT);
  checks.push([
    "authenticated self-assignment changes nothing, including the region in the same statement",
    locked(selfAssign) &&
      patientAfter.region_id === "es" &&
      patientAfter.daily_carb_goal_g === 150 &&
      sameProfessionalAttrs(patientAfter, {
        is_professional: false,
        professional_role: null,
        professional_share_code: null,
      }),
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: PATIENT,
    jwtRole: "authenticated",
  });
  const crossInsert = await run(
    db,
    `
    insert into public.user_profiles (user_id, region_id)
    values (${sqlString(PROFESSIONAL)}, 'do')
    `,
  );
  checks.push([
    "authenticated cannot insert a profile for someone else",
    crossInsert.ok === false && crossInsert.code === "42501",
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: PATIENT,
    jwtRole: "service_role",
  });
  const forgedJwt = await identity(db);
  const forgedWrite = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true
    where user_id = ${sqlString(PATIENT)}
    `,
  );
  checks.push([
    "a service_role JWT does not exempt an authenticated session",
    forgedJwt.rows[0]?.current_user === "authenticated" &&
      forgedJwt.rows[0]?.jwt_role === "service_role" &&
      forgedJwt.rows[0]?.bypass === false &&
      locked(forgedWrite),
  ]);

  await setSession(db, { jwtRole: "service_role", userId: PATIENT });
  const forgedPostgres = await identity(db);
  const postgresForgedWrite = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true
    where user_id = ${sqlString(PATIENT)}
    `,
  );
  const patientStill = await readProfile(db, PATIENT);
  checks.push([
    "a service_role JWT does not exempt postgres",
    forgedPostgres.rows[0]?.current_user === "postgres" &&
      forgedPostgres.rows[0]?.jwt_role === "service_role" &&
      locked(postgresForgedWrite) &&
      patientStill.is_professional === false,
  ]);

  await setSession(db, {});
  const postgresRegion = await run(
    db,
    `
    update public.user_profiles
    set region_id = 'es',
        updated_at = now()
    where user_id = ${sqlString(PROFESSIONAL)}
    returning region_id, is_professional, professional_share_code
    `,
  );
  const postgresElevate = await run(
    db,
    `
    update public.user_profiles
    set is_professional = false
    where user_id = ${sqlString(PROFESSIONAL)}
    `,
  );
  const afterPostgres = await readProfile(db, PROFESSIONAL);
  checks.push([
    "postgres can change region and cannot change professional columns when the JWT role is null",
    postgresRegion.ok === true &&
      locked(postgresElevate) &&
      afterPostgres.region_id === "es" &&
      sameProfessionalAttrs(afterPostgres, {
        is_professional: true,
        professional_role: "endocrinologia",
        professional_share_code: "AAAAAA",
      }),
  ]);

  await setSession(db, { role: "service_role", userId: PATIENT });
  const nullJwt = await identity(db);
  const nullJwtWrite = await run(
    db,
    `
    update public.user_profiles
    set professional_share_code = 'DDDDDD'
    where user_id = ${sqlString(PATIENT)}
    `,
  );
  checks.push([
    "service_role without a JWT role is not exempt",
    nullJwt.rows[0]?.current_user === "service_role" &&
      nullJwt.rows[0]?.jwt_role === null &&
      nullJwt.rows[0]?.bypass === true &&
      locked(nullJwtWrite),
  ]);

  await setSession(db, {
    role: "service_role",
    userId: PATIENT,
    jwtRole: "service_role ",
  });
  const padded = await identity(db);
  const paddedWrite = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true
    where user_id = ${sqlString(PATIENT)}
    `,
  );
  checks.push([
    "a padded service_role claim is not exact and is rejected",
    padded.rows[0]?.jwt_role === "service_role " && locked(paddedWrite),
  ]);

  await setSession(db, {
    role: "service_role",
    userId: PATIENT,
    jwtRole: "authenticated",
    claimsRole: "service_role",
  });
  const claimWins = await identity(db);
  const claimWinsWrite = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true
    where user_id = ${sqlString(PATIENT)}
    `,
  );
  checks.push([
    "auth.role() prefers request.jwt.claim.role, so a conflicting JSON role does not exempt",
    claimWins.rows[0]?.current_user === "service_role" &&
      claimWins.rows[0]?.jwt_role === "authenticated" &&
      locked(claimWinsWrite),
  ]);

  await setSession(db, {
    role: "service_role",
    userId: PATIENT,
    jwtRole: "",
    claimsRole: "service_role",
  });
  const claimsOnly = await identity(db);
  const claimsOnlyWrite = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true,
        professional_role = 'nutricion',
        professional_share_code = 'CCCCCC'
    where user_id = ${sqlString(PATIENT)}
    returning is_professional, professional_role, professional_share_code
    `,
  );
  checks.push([
    "service_role is exempt when current_user matches auth.role() from the JSON claim",
    claimsOnly.rows[0]?.current_user === "service_role" &&
      claimsOnly.rows[0]?.jwt_role === "service_role" &&
      claimsOnlyWrite.ok === true &&
      claimsOnlyWrite.rows[0]?.is_professional === true &&
      claimsOnlyWrite.rows[0]?.professional_share_code === "CCCCCC",
  ]);

  await setSession(db, {
    role: "service_role",
    userId: PATIENT,
    jwtRole: "service_role",
  });
  const directClaim = await identity(db);
  const restored = await run(
    db,
    `
    update public.user_profiles
    set is_professional = false,
        professional_role = null,
        professional_share_code = null
    where user_id = ${sqlString(PATIENT)}
    returning is_professional, professional_role, professional_share_code
    `,
  );
  const patientRestored = await readProfile(db, PATIENT);
  checks.push([
    "service_role is exempt when both the session and request.jwt.claim.role match",
    directClaim.rows[0]?.jwt_role === "service_role" &&
      restored.ok === true &&
      patientRestored.region_id === "es" &&
      sameProfessionalAttrs(patientRestored, {
        is_professional: false,
        professional_role: null,
        professional_share_code: null,
      }),
  ]);

  const roleBoundary = await authenticatedCannotAssumeServiceRole();
  checks.push([
    "authenticated is not a member of service_role and cannot assume it",
    roleBoundary.member === false &&
      roleBoundary.error?.code === "42501" &&
      roleBoundary.current_user === "authenticated" &&
      roleBoundary.session_user === "authenticated",
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: DELETE_ME,
    jwtRole: "authenticated",
  });
  const deleteMeInsert = await run(
    db,
    `
    insert into public.user_profiles (user_id, region_id)
    values (${sqlString(DELETE_ME)}, 'es')
    `,
  );
  await setSession(db, { role: "service_role" });
  const deleted = await run(
    db,
    `
    delete from public.user_profiles
    where user_id = ${sqlString(DELETE_ME)}
    returning user_id::text
    `,
  );
  const deleteMeGone = await readProfile(db, DELETE_ME);
  checks.push([
    "service_role can delete a profile without a JWT, because delete does not use the column exemption",
    deleteMeInsert.ok === true &&
      deleted.ok === true &&
      deleted.rows.length === 1 &&
      deleteMeGone === null,
  ]);

  await setSession(db, {
    role: "authenticated",
    userId: ONBOARD,
    jwtRole: "authenticated",
  });
  const ownDelete = await run(
    db,
    `
    delete from public.user_profiles
    where user_id = ${sqlString(ONBOARD)}
    `,
  );
  checks.push([
    "authenticated cannot delete its own profile",
    ownDelete.ok === false && ownDelete.code === "42501",
  ]);

  for (const role of ["anon", "authenticated", "service_role"]) {
    await setSession(db, {
      role,
      userId: PATIENT,
      jwtRole: role === "service_role" ? "service_role" : role,
    });
    const called = await run(
      db,
      "select public.protect_user_profile_professional_columns()",
    );
    checks.push([
      `${role} cannot call the trigger function directly`,
      called.ok === false && called.code === "42501",
    ]);
  }

  await setSession(db, {
    role: "authenticated",
    userId: GAP,
    jwtRole: "authenticated",
  });
  const gapInsert = await run(
    db,
    `
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, updated_at
    ) values (
      ${sqlString(GAP)}, 'es', 140, false, now()
    )
    `,
  );

  await setSession(db, {});
  await db.exec(
    "drop trigger protect_user_profile_professional_columns on public.user_profiles",
  );
  await db.exec(
    "grant all privileges on table public.user_profiles to anon, authenticated",
  );

  await setSession(db, {
    role: "authenticated",
    userId: GAP,
    jwtRole: "authenticated",
  });
  const gapOpened = await run(
    db,
    `
    update public.user_profiles
    set is_professional = true,
        professional_role = 'nutricion'
    where user_id = ${sqlString(GAP)}
    returning is_professional, professional_role
    `,
  );

  await setSession(db, {});
  const professionalBeforeRecovery = await readProfile(db, PROFESSIONAL);
  await db.exec(fs.readFileSync(recoveryFile, "utf8"));
  const professionalAfterRecovery = await readProfile(db, PROFESSIONAL);
  const gapAfterRecovery = await readProfile(db, GAP);
  const recoveredPrivileges = await privilegeProbe(db);

  await setSession(db, {
    role: "authenticated",
    userId: GAP,
    jwtRole: "authenticated",
  });
  const gapRelocked = await run(
    db,
    `
    update public.user_profiles
    set professional_share_code = 'ZZZZZZ'
    where user_id = ${sqlString(GAP)}
    `,
  );
  const gapRegion = await run(
    db,
    `
    update public.user_profiles
    set region_id = 'do',
        is_professional = true,
        professional_role = 'nutricion',
        professional_share_code = null,
        updated_at = now()
    where user_id = ${sqlString(GAP)}
    returning region_id
    `,
  );
  const gapFinal = await readProfile(db, GAP);
  const recovered = recoveredPrivileges.rows[0];

  checks.push([
    "safe recovery relocks without rewriting rows or restoring grant all",
    gapInsert.ok === true &&
      gapOpened.ok === true &&
      gapOpened.rows[0]?.is_professional === true &&
      JSON.stringify(professionalBeforeRecovery) ===
        JSON.stringify(professionalAfterRecovery) &&
      gapAfterRecovery.is_professional === true &&
      gapAfterRecovery.professional_role === "nutricion" &&
      gapAfterRecovery.professional_share_code === null &&
      locked(gapRelocked) &&
      gapRegion.ok === true &&
      gapFinal.region_id === "do" &&
      gapFinal.is_professional === true &&
      gapFinal.professional_share_code === null &&
      recovered.anon_select === false &&
      recovered.authenticated_select === true &&
      recovered.authenticated_insert === true &&
      recovered.authenticated_update === true &&
      recovered.authenticated_delete === false &&
      recovered.authenticated_truncate === false &&
      recovered.service_delete === true,
  ]);

  const report = {
    validation: {
      engine: "PGlite",
      pgliteVersion,
      postgrest: "not run",
      supabase: "not run",
      production: "not verified",
      authoritativeRun:
        "GitHub Actions workflow s1-profile-lock checks out the commit and sets S1_EXPECT_COMMIT to that SHA. This JSON records the HEAD at the moment the file was generated. If that HEAD is an ancestor of the commit that adds the file, the Actions run is the check for the commit itself.",
      note: "Preliminary in-memory result. The PostgreSQL and PostgREST run is scripts/user_profile_professional_lock.integration.cjs. Neither run is a production verification.",
    },
    engine: version.rows[0].version,
    headAtRun,
    migrationSha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(lockFile))
      .digest("hex"),
    recoveryMatchesMigration: true,
    migrationHasNoDataChange: true,
    activateRouteHasNoProfileWrite: true,
    migrationsAppliedExcept: migrationNotes,
    identityMechanism: {
      exemption:
        "current_user = 'service_role' AND auth.role() = 'service_role'",
      authRole:
        "coalesce(nullif(request.jwt.claim.role, ''), request.jwt.claims ->> 'role')",
      rejected: [
        "null jwt role",
        "blank jwt role",
        "padded service_role claim",
        "postgres, including postgres with a service_role jwt",
        "authenticated with a service_role jwt",
        "service_role session whose jwt role is authenticated",
      ],
    },
    roleBoundary,
    privileges: {
      afterHistoricalMigrations: afterHistory.rows[0],
      afterSimulatedProductionDefaultGrants: beforeLock.rows[0],
      afterS1: afterLock.rows[0],
      afterSafeRecovery: recoveredPrivileges.rows[0],
    },
    checks,
    passed: checks.every(([, ok]) => ok),
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  console.log(
    JSON.stringify(
      { passed: report.passed, failed, engine: report.engine },
      null,
      2,
    ),
  );
  await db.close();
  process.exit(report.passed ? 0 : 1);
}

main().catch((error) => {
  console.error(shortError(error).message);
  process.exit(1);
});
