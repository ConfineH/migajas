const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { PGlite } = require("@electric-sql/pglite");

// In-memory check of the share suspension.
// Does not open a network connection and does not read production data.
// GitHub Actions sets S2_EXPECT_COMMIT to the checked-out SHA.
const repoRoot = path.resolve(__dirname, "..");
const pgliteVersion = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "node_modules/@electric-sql/pglite/package.json"),
    "utf8",
  ),
).version;
const repoMigrations = path.join(repoRoot, "supabase", "migrations");
const migrationName = "20261124180000_suspend_professional_shares.sql";
const s1Name = "20261124120000_lock_user_profile_professional_columns.sql";
const migrationFile = path.join(repoMigrations, migrationName);
const recoveryFile = path.join(
  repoRoot,
  "supabase/recovery/s2_reassert_share_suspension.sql",
);
const reportFile = path.join(__dirname, "professional_share_suspension.result.json");

const PATIENT = "11111111-1111-4111-8111-111111111111";
const PROFESSIONAL = "22222222-2222-4222-8222-222222222222";
const STRANGER = "33333333-3333-4333-8333-333333333333";
const OTHER = "44444444-4444-4444-8444-444444444444";
const DELETE_ME = "55555555-5555-4555-8555-555555555555";

const KNOWN_REPLAY_GAPS = new Set([
  "20260713160000_seed_content.sql",
  "20260714160300_lock_admin_rpc.sql",
]);
const DEFER = new Set([s1Name, migrationName]);

const SHARE_FN = "public.share_report_with_professional(text, date, date, jsonb)";
const LOOKUP_FN = "public.lookup_professional_by_share_code(text)";
const LIST_FN = "public.list_patient_share_recipients()";

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
  if (!match) throw new Error(`missing lock markers in ${file}`);
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
    throw new Error("suspension SQL contains a data-changing statement");
  }
}

async function run(db, sql) {
  try {
    const result = await db.query(sql);
    return { ok: true, code: null, message: null, rows: result.rows };
  } catch (error) {
    return { ...shortError(error), rows: [] };
  }
}

async function setSession(db, { role = null, userId = null, jwtRole } = {}) {
  await db.exec("reset role");
  await db.exec(
    `select set_config('request.jwt.claim.sub', ${sqlString(userId ?? "")}, false)`,
  );
  await db.exec(
    `select set_config('request.jwt.claim.role', ${sqlString(jwtRole ?? "")}, false)`,
  );
  const claims = JSON.stringify({
    sub: userId ?? "",
    role: jwtRole ?? "",
  });
  await db.exec(
    `select set_config('request.jwt.claims', ${sqlString(claims)}, false)`,
  );
  if (role) await db.exec(`set role ${role}`);
}

async function contacts(db) {
  await setSession(db, {});
  const result = await run(
    db,
    `
    select patient_user_id::text as patient_user_id,
           professional_user_id::text as professional_user_id,
           label
    from public.patient_professional_contacts
    order by patient_user_id, professional_user_id
    `,
  );
  if (!result.ok) throw new Error(result.message);
  return result.rows;
}

async function shares(db) {
  await setSession(db, {});
  const result = await run(
    db,
    `
    select patient_user_id::text as patient_user_id,
           professional_user_id::text as professional_user_id,
           snapshot->>'source' as source
    from public.professional_report_shares
    order by patient_user_id, professional_user_id, source
    `,
  );
  if (!result.ok) throw new Error(result.message);
  return result.rows;
}

async function privileges(db) {
  await setSession(db, {});
  const result = await run(
    db,
    `
    select
      has_table_privilege('anon', 'public.patient_professional_contacts', 'SELECT') as anon_contact_select,
      has_table_privilege('anon', 'public.patient_professional_contacts', 'INSERT') as anon_contact_insert,
      has_table_privilege('anon', 'public.patient_professional_contacts', 'UPDATE') as anon_contact_update,
      has_table_privilege('anon', 'public.patient_professional_contacts', 'DELETE') as anon_contact_delete,
      has_table_privilege('anon', 'public.patient_professional_contacts', 'TRUNCATE') as anon_contact_truncate,
      has_table_privilege('public', 'public.patient_professional_contacts', 'INSERT') as public_contact_insert,
      has_table_privilege('authenticated', 'public.patient_professional_contacts', 'SELECT') as auth_contact_select,
      has_table_privilege('authenticated', 'public.patient_professional_contacts', 'INSERT') as auth_contact_insert,
      has_table_privilege('authenticated', 'public.patient_professional_contacts', 'UPDATE') as auth_contact_update,
      has_table_privilege('authenticated', 'public.patient_professional_contacts', 'DELETE') as auth_contact_delete,
      has_table_privilege('authenticated', 'public.patient_professional_contacts', 'TRUNCATE') as auth_contact_truncate,
      has_table_privilege('service_role', 'public.patient_professional_contacts', 'SELECT') as service_contact_select,
      has_table_privilege('service_role', 'public.patient_professional_contacts', 'INSERT') as service_contact_insert,
      has_table_privilege('service_role', 'public.patient_professional_contacts', 'UPDATE') as service_contact_update,
      has_table_privilege('service_role', 'public.patient_professional_contacts', 'DELETE') as service_contact_delete,
      has_table_privilege('service_role', 'public.patient_professional_contacts', 'TRUNCATE') as service_contact_truncate,
      has_table_privilege('anon', 'public.professional_report_shares', 'INSERT') as anon_share_insert,
      has_table_privilege('anon', 'public.professional_report_shares', 'TRUNCATE') as anon_share_truncate,
      has_table_privilege('authenticated', 'public.professional_report_shares', 'SELECT') as auth_share_select,
      has_table_privilege('authenticated', 'public.professional_report_shares', 'INSERT') as auth_share_insert,
      has_table_privilege('authenticated', 'public.professional_report_shares', 'UPDATE') as auth_share_update,
      has_table_privilege('authenticated', 'public.professional_report_shares', 'DELETE') as auth_share_delete,
      has_table_privilege('authenticated', 'public.professional_report_shares', 'TRUNCATE') as auth_share_truncate,
      has_table_privilege('service_role', 'public.professional_report_shares', 'SELECT') as service_share_select,
      has_table_privilege('service_role', 'public.professional_report_shares', 'INSERT') as service_share_insert,
      has_table_privilege('service_role', 'public.professional_report_shares', 'DELETE') as service_share_delete,
      has_function_privilege('public', '${SHARE_FN}', 'EXECUTE') as public_share_exec,
      has_function_privilege('anon', '${SHARE_FN}', 'EXECUTE') as anon_share_exec,
      has_function_privilege('authenticated', '${SHARE_FN}', 'EXECUTE') as auth_share_exec,
      has_function_privilege('service_role', '${SHARE_FN}', 'EXECUTE') as service_share_exec,
      has_function_privilege('public', '${LOOKUP_FN}', 'EXECUTE') as public_lookup_exec,
      has_function_privilege('anon', '${LOOKUP_FN}', 'EXECUTE') as anon_lookup_exec,
      has_function_privilege('authenticated', '${LOOKUP_FN}', 'EXECUTE') as auth_lookup_exec,
      has_function_privilege('service_role', '${LOOKUP_FN}', 'EXECUTE') as service_lookup_exec,
      has_function_privilege('public', '${LIST_FN}', 'EXECUTE') as public_list_exec,
      has_function_privilege('anon', '${LIST_FN}', 'EXECUTE') as anon_list_exec,
      has_function_privilege('authenticated', '${LIST_FN}', 'EXECUTE') as auth_list_exec,
      has_function_privilege('service_role', '${LIST_FN}', 'EXECUTE') as service_list_exec,
      has_table_privilege('authenticated', 'public.user_profiles', 'SELECT') as auth_profile_select,
      has_table_privilege('authenticated', 'public.user_profiles', 'INSERT') as auth_profile_insert,
      has_table_privilege('authenticated', 'public.user_profiles', 'UPDATE') as auth_profile_update,
      has_table_privilege('authenticated', 'public.user_profiles', 'DELETE') as auth_profile_delete,
      has_table_privilege('authenticated', 'public.intake_entries', 'INSERT') as auth_intake_insert,
      has_table_privilege('authenticated', 'public.professional_contact_messages', 'INSERT') as auth_message_insert,
      has_table_privilege('authenticated', 'public.professional_contact_messages', 'SELECT') as auth_message_select
    `,
  );
  if (!result.ok) throw new Error(result.message);
  return result.rows[0];
}

function suspended(priv) {
  return (
    priv.anon_contact_select === false &&
    priv.anon_contact_insert === false &&
    priv.anon_contact_update === false &&
    priv.anon_contact_delete === false &&
    priv.anon_contact_truncate === false &&
    priv.public_contact_insert === false &&
    priv.auth_contact_select === true &&
    priv.auth_contact_insert === false &&
    priv.auth_contact_update === false &&
    priv.auth_contact_delete === true &&
    priv.auth_contact_truncate === false &&
    priv.service_contact_select === true &&
    priv.service_contact_insert === false &&
    priv.service_contact_update === false &&
    priv.service_contact_delete === true &&
    priv.service_contact_truncate === false &&
    priv.anon_share_insert === false &&
    priv.anon_share_truncate === false &&
    priv.auth_share_select === true &&
    priv.auth_share_insert === false &&
    priv.auth_share_update === false &&
    priv.auth_share_delete === true &&
    priv.auth_share_truncate === false &&
    priv.service_share_select === true &&
    priv.service_share_insert === false &&
    priv.service_share_delete === true &&
    priv.public_share_exec === false &&
    priv.anon_share_exec === false &&
    priv.auth_share_exec === false &&
    priv.service_share_exec === false &&
    priv.public_lookup_exec === false &&
    priv.anon_lookup_exec === false &&
    priv.auth_lookup_exec === false &&
    priv.service_lookup_exec === false &&
    priv.public_list_exec === false &&
    priv.anon_list_exec === false &&
    priv.auth_list_exec === true &&
    priv.service_list_exec === false &&
    priv.auth_profile_select === true &&
    priv.auth_profile_insert === true &&
    priv.auth_profile_update === true &&
    priv.auth_profile_delete === false &&
    priv.auth_intake_insert === true &&
    priv.auth_message_insert === true &&
    priv.auth_message_select === true
  );
}

async function main() {
  if (pgliteVersion !== "0.5.16") {
    throw new Error(`expected @electric-sql/pglite 0.5.16, found ${pgliteVersion}`);
  }
  const headAtRun = execSync("git rev-parse HEAD", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (process.env.S2_EXPECT_COMMIT && process.env.S2_EXPECT_COMMIT !== headAtRun) {
    throw new Error(
      `HEAD ${headAtRun} does not match S2_EXPECT_COMMIT ${process.env.S2_EXPECT_COMMIT}`,
    );
  }

  const migrationSql = fs.readFileSync(migrationFile, "utf8");
  const recoverySql = fs.readFileSync(recoveryFile, "utf8");
  const section = lockSection(migrationFile);
  if (section !== lockSection(recoveryFile)) {
    throw new Error("recovery SQL does not repeat the migration statements");
  }
  assertNoDataChange(section);
  if (
    /\bgrant\s+(insert|update|truncate|execute\s+on\s+function\s+public\.share_report|\s*execute\s+on\s+function\s+public\.lookup)/i.test(
      section,
    )
  ) {
    throw new Error("suspension SQL grants a privilege it is supposed to remove");
  }
  for (const file of [
    "src/app/api/professional/shares/route.ts",
    "src/app/api/professional/lookup/route.ts",
    "src/lib/supabase/professional.ts",
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, file), "utf8");
    if (/share_report_with_professional|lookup_professional_by_share_code/.test(source)) {
      throw new Error(`${file} still calls a suspended RPC`);
    }
  }

  const db = new PGlite();
  const version = await db.query("select version()");
  const checks = [];
  const migrationNotes = [];

  await db.exec(`
    create role anon nologin nosuperuser nobypassrls;
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    create schema if not exists auth;
    grant usage on schema auth to public, anon, authenticated, service_role;
    create table if not exists auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create or replace function auth.uid()
    returns uuid language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      )::uuid;
    $$;
    create or replace function auth.role()
    returns text language sql stable as $$
      select coalesce(
        nullif(current_setting('request.jwt.claim.role', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
      )::text;
    $$;
    grant execute on function auth.uid() to public, anon, authenticated, service_role;
    grant execute on function auth.role() to public, anon, authenticated, service_role;
    alter default privileges in schema public
      grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public
      grant execute on functions to anon, authenticated, service_role;
  `);

  const files = fs
    .readdirSync(repoMigrations)
    .filter((name) => name.endsWith(".sql") && !DEFER.has(name))
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
      console.error(`migration failed ${name}: ${failure.message}`);
      process.exit(1);
    }
  }

  await db.exec(`
    insert into auth.users (id, email) values
      (${sqlString(PATIENT)}, 'patient@example.test'),
      (${sqlString(PROFESSIONAL)}, 'professional@example.test'),
      (${sqlString(STRANGER)}, 'stranger@example.test'),
      (${sqlString(OTHER)}, 'other@example.test'),
      (${sqlString(DELETE_ME)}, 'delete-me@example.test');
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled,
      is_professional, professional_role, professional_share_code
    ) values
      (${sqlString(PATIENT)}, 'es', 150, false, false, null, null),
      (${sqlString(PROFESSIONAL)}, 'es', 200, true, true, 'endocrinologia', 'AAAAAA'),
      (${sqlString(STRANGER)}, 'es', 180, true, true, 'nutricion', 'BBBBBB'),
      (${sqlString(OTHER)}, 'es', 160, false, false, null, null),
      (${sqlString(DELETE_ME)}, 'es', 140, false, false, null, null);
    insert into public.professional_report_shares (
      professional_user_id, patient_user_id, range_from, range_to, snapshot
    ) values
      (${sqlString(PROFESSIONAL)}, ${sqlString(PATIENT)}, '2026-01-01', '2026-01-07', '{"source":"historical"}'),
      (${sqlString(PROFESSIONAL)}, ${sqlString(DELETE_ME)}, '2026-02-01', '2026-02-07', '{"source":"delete-me"}');
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values
      (${sqlString(PATIENT)}, ${sqlString(PROFESSIONAL)}, 'endocrinologia'),
      (${sqlString(DELETE_ME)}, ${sqlString(PROFESSIONAL)}, 'otro');
  `);

  const beforeS1 = await contacts(db);
  await db.exec(fs.readFileSync(path.join(repoMigrations, s1Name), "utf8"));
  const afterS1 = await contacts(db);
  checks.push([
    "S1 leaves historical contacts unchanged",
    JSON.stringify(beforeS1) === JSON.stringify(afterS1),
  ]);

  const before = {
    contacts: await contacts(db),
    shares: await shares(db),
  };
  const broadBefore = await privileges(db);
  checks.push([
    "default privileges leave INSERT and EXECUTE open before S2",
    broadBefore.auth_contact_insert === true &&
      broadBefore.anon_contact_insert === true &&
      broadBefore.auth_share_exec === true &&
      broadBefore.anon_share_exec === true &&
      broadBefore.service_share_exec === true,
  ]);

  await db.exec(migrationSql);
  const after = {
    contacts: await contacts(db),
    shares: await shares(db),
  };
  checks.push([
    "S2 does not rewrite historical shares or contacts",
    JSON.stringify(before) === JSON.stringify(after) && before.contacts.length === 2,
  ]);

  const priv = await privileges(db);
  checks.push(["privileges match the suspension matrix", suspended(priv)]);

  const policy = await run(
    db,
    `
    select pg_get_expr(polwithcheck, polrelid) as check_expr
    from pg_policy
    where polrelid = 'public.patient_professional_contacts'::regclass
      and polname = 'Patients insert own professional contacts'
    `,
  );
  const checkExpr = policy.rows[0]?.check_expr || "";
  checks.push([
    "insert policy binds the contact patient, professional, and share",
    checkExpr.includes("patient_professional_contacts.patient_user_id") &&
      checkExpr.includes("patient_professional_contacts.professional_user_id") &&
      checkExpr.includes("share.patient_user_id") &&
      checkExpr.includes("share.professional_user_id") &&
      !checkExpr.includes("share.patient_user_id = share.patient_user_id"),
  ]);

  const trigger = await run(
    db,
    `
    select p.prosecdef as definer,
           p.proconfig::text as config,
           pg_get_triggerdef(t.oid) as def
    from pg_proc p
    join pg_trigger t on t.tgfoid = p.oid
    where p.proname = 'prevent_patient_professional_contact_reassignment'
      and t.tgname = 'prevent_patient_professional_contact_reassignment'
    `,
  );
  checks.push([
    "reassignment trigger is invoker with an empty search_path",
    trigger.rows[0]?.definer === false &&
      String(trigger.rows[0]?.config || "").includes("search_path=") &&
      String(trigger.rows[0]?.def || "").includes("BEFORE UPDATE"),
  ]);

  const defaults = await run(
    db,
    `
    select count(*)::int as n
    from pg_default_acl
    where defaclnamespace = 'public'::regnamespace
    `,
  );
  checks.push([
    "schema default privileges remain and do not reopen these objects",
    defaults.rows[0].n > 0 && suspended(await privileges(db)),
  ]);

  const deniedInsert = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      insert into public.patient_professional_contacts
        (patient_user_id, professional_user_id, label)
      values (${sqlString(PATIENT)}, ${sqlString(STRANGER)}, 'nutricion')
      `,
    );
  })();
  checks.push([
    "authenticated cannot insert a contact",
    deniedInsert.ok === false && deniedInsert.code === "42501",
  ]);

  const deniedShare = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      insert into public.professional_report_shares
        (professional_user_id, patient_user_id, range_from, range_to, snapshot)
      values (${sqlString(PROFESSIONAL)}, ${sqlString(PATIENT)}, '2026-03-01', '2026-03-07', '{}')
      `,
    );
  })();
  checks.push([
    "authenticated cannot insert a share directly",
    deniedShare.ok === false && deniedShare.code === "42501",
  ]);

  const serviceInsert = await (async () => {
    await setSession(db, { role: "service_role", userId: PATIENT, jwtRole: "service_role" });
    return run(
      db,
      `
      select public.share_report_with_professional(
        'AAAAAA', '2026-03-01'::date, '2026-03-07'::date, '{}'::jsonb
      )
      `,
    );
  })();
  checks.push([
    "service_role cannot execute share_report_with_professional",
    serviceInsert.ok === false && serviceInsert.code === "42501",
  ]);

  const lookupDenied = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `select public.lookup_professional_by_share_code('AAAAAA')`,
    );
  })();
  checks.push([
    "authenticated cannot execute lookup_professional_by_share_code",
    lookupDenied.ok === false && lookupDenied.code === "42501",
  ]);

  const anonLookup = await (async () => {
    await setSession(db, { role: "anon", jwtRole: "anon" });
    return run(db, `select public.lookup_professional_by_share_code('AAAAAA')`);
  })();
  checks.push([
    "anon cannot execute lookup_professional_by_share_code",
    anonLookup.ok === false && anonLookup.code === "42501",
  ]);

  const ownList = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      select value->>'professional_user_id' as professional_user_id
      from jsonb_array_elements(public.list_patient_share_recipients()) as value
      `,
    );
  })();
  const otherList = await (async () => {
    await setSession(db, { role: "authenticated", userId: OTHER, jwtRole: "authenticated" });
    return run(
      db,
      `
      select value->>'professional_user_id' as professional_user_id
      from jsonb_array_elements(public.list_patient_share_recipients()) as value
      `,
    );
  })();
  checks.push([
    "list_patient_share_recipients returns only the caller",
    ownList.ok &&
      ownList.rows.length === 1 &&
      ownList.rows[0].professional_user_id === PROFESSIONAL &&
      otherList.ok &&
      otherList.rows.length === 0,
  ]);

  const ownRead = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `select label from public.patient_professional_contacts where patient_user_id = ${sqlString(PATIENT)}`,
    );
  })();
  const otherRead = await (async () => {
    await setSession(db, { role: "authenticated", userId: OTHER, jwtRole: "authenticated" });
    return run(
      db,
      `select label from public.patient_professional_contacts where patient_user_id = ${sqlString(PATIENT)}`,
    );
  })();
  const professionalRead = await (async () => {
    await setSession(db, {
      role: "authenticated",
      userId: PROFESSIONAL,
      jwtRole: "authenticated",
    });
    return run(
      db,
      `
      select snapshot->>'source' as source
      from public.professional_report_shares
      where professional_user_id = ${sqlString(PROFESSIONAL)}
      order by source
      `,
    );
  })();
  checks.push([
    "patient export select sees own contacts and another user sees none",
    ownRead.ok &&
      ownRead.rows.length === 1 &&
      ownRead.rows[0].label === "endocrinologia" &&
      otherRead.ok &&
      otherRead.rows.length === 0,
  ]);
  checks.push([
    "historical professional read of shares addressed to them still works",
    professionalRead.ok &&
      professionalRead.rows.map((row) => row.source).join(",") === "delete-me,historical",
  ]);

  await setSession(db, {});
  await db.exec(
    "grant insert, update on table public.patient_professional_contacts to authenticated",
  );
  const tautology = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      insert into public.patient_professional_contacts
        (patient_user_id, professional_user_id, label)
      values (${sqlString(PATIENT)}, ${sqlString(STRANGER)}, 'nutricion')
      `,
    );
  })();
  const seenByProfessional = await (async () => {
    await setSession(db, {
      role: "authenticated",
      userId: PROFESSIONAL,
      jwtRole: "authenticated",
    });
    return run(
      db,
      `
      insert into public.patient_professional_contacts
        (patient_user_id, professional_user_id, label)
      values (${sqlString(PROFESSIONAL)}, ${sqlString(STRANGER)}, 'otro')
      `,
    );
  })();
  await setSession(db, {});
  await db.exec(`
    insert into public.professional_report_shares (
      professional_user_id, patient_user_id, range_from, range_to, snapshot
    ) values (
      ${sqlString(STRANGER)}, ${sqlString(PATIENT)}, '2026-04-01', '2026-04-07', '{"source":"probe"}'
    );
  `);
  const matched = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      insert into public.patient_professional_contacts
        (patient_user_id, professional_user_id, label)
      values (${sqlString(PATIENT)}, ${sqlString(STRANGER)}, 'nutricion')
      `,
    );
  })();
  checks.push([
    "corrected policy rejects a contact without a share between that pair",
    tautology.ok === false &&
      /row-level security/i.test(tautology.message || "") &&
      seenByProfessional.ok === false,
  ]);
  checks.push([
    "corrected policy accepts a contact for an existing share of the same pair",
    matched.ok === true,
  ]);

  const reassignment = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      update public.patient_professional_contacts
      set professional_user_id = ${sqlString(STRANGER)}
      where patient_user_id = ${sqlString(PATIENT)}
        and professional_user_id = ${sqlString(PROFESSIONAL)}
      `,
    );
  })();
  const labelChange = await (async () => {
    await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
    return run(
      db,
      `
      update public.patient_professional_contacts
      set label = 'nutricion'
      where patient_user_id = ${sqlString(PATIENT)}
        and professional_user_id = ${sqlString(PROFESSIONAL)}
      `,
    );
  })();
  checks.push([
    "trigger rejects reassignment and still allows a label change",
    reassignment.ok === false &&
      reassignment.code === "23514" &&
      labelChange.ok === true,
  ]);

  await setSession(db, {});
  await db.exec(`
    update public.patient_professional_contacts
    set label = 'endocrinologia'
    where patient_user_id = ${sqlString(PATIENT)}
      and professional_user_id = ${sqlString(PROFESSIONAL)};
    delete from public.patient_professional_contacts
    where patient_user_id = ${sqlString(PATIENT)}
      and professional_user_id = ${sqlString(STRANGER)};
    delete from public.professional_report_shares
    where snapshot->>'source' = 'probe';
    revoke insert, update on table public.patient_professional_contacts from authenticated;
    grant insert, update on table public.patient_professional_contacts to anon, authenticated, service_role;
    grant execute on function ${SHARE_FN} to public, anon, authenticated, service_role;
    grant execute on function ${LOOKUP_FN} to public, anon, authenticated, service_role;
  `);
  const reopened = await privileges(db);
  checks.push([
    "a restored grant reopens insert and execute",
    reopened.auth_contact_insert === true && reopened.auth_share_exec === true,
  ]);
  await db.exec(recoverySql);
  const restoredRows = {
    contacts: await contacts(db),
    shares: await shares(db),
  };
  checks.push([
    "recovery closes the grants again without rewriting historical rows",
    suspended(await privileges(db)) &&
      JSON.stringify(restoredRows) === JSON.stringify(before),
  ]);

  const patientRevoke = await (async () => {
    await setSession(db, { role: "authenticated", userId: DELETE_ME, jwtRole: "authenticated" });
    return run(
      db,
      `
      delete from public.professional_report_shares
      where patient_user_id = ${sqlString(DELETE_ME)}
      `,
    );
  })();
  const otherRevoke = await (async () => {
    await setSession(db, { role: "authenticated", userId: OTHER, jwtRole: "authenticated" });
    return run(
      db,
      `
      delete from public.professional_report_shares
      where patient_user_id = ${sqlString(PATIENT)}
      `,
    );
  })();
  const remainingPatientShares = await (async () => {
    await setSession(db, {});
    return run(
      db,
      `
      select count(*)::int as n
      from public.professional_report_shares
      where patient_user_id = ${sqlString(PATIENT)}
      `,
    );
  })();
  checks.push([
    "the patient can revoke own shares and another user cannot",
    patientRevoke.ok === true &&
      otherRevoke.ok === true &&
      remainingPatientShares.rows[0].n === 1,
  ]);

  const serviceDelete = await (async () => {
    await setSession(db, { role: "service_role", userId: DELETE_ME, jwtRole: "service_role" });
    const contact = await run(
      db,
      `
      delete from public.patient_professional_contacts
      where patient_user_id = ${sqlString(DELETE_ME)}
         or professional_user_id = ${sqlString(DELETE_ME)}
      `,
    );
    const share = await run(
      db,
      `
      delete from public.professional_report_shares
      where patient_user_id = ${sqlString(DELETE_ME)}
         or professional_user_id = ${sqlString(DELETE_ME)}
      `,
    );
    return contact.ok && share.ok;
  })();
  const patientStillThere = (await contacts(db)).some(
    (row) => row.patient_user_id === PATIENT && row.professional_user_id === PROFESSIONAL,
  );
  checks.push([
    "service_role account deletion removes the fictional account and keeps the other",
    serviceDelete === true && patientStillThere,
  ]);

  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  const report = {
    kind: "pglite",
    pgliteVersion,
    postgres: version.rows[0].version,
    headAtRun,
    expectedCommit: process.env.S2_EXPECT_COMMIT || null,
    migrationSha256: crypto.createHash("sha256").update(migrationSql).digest("hex"),
    migrationNotes,
    privileges: priv,
    checks,
    passed: failed.length === 0,
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, failed }, null, 2));
  await db.close();
  return report.passed ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
