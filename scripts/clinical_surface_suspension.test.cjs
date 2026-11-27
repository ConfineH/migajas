const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PGlite } = require("@electric-sql/pglite");

// Isolated catalog check. Creates stub tables, applies only the S3 file,
// and does not replay historical migrations or open a network connection.
const repoRoot = path.resolve(__dirname, "..");
const migrationName = "20261125120000_suspend_clinical_surface.sql";
const migrationFile = path.join(repoRoot, "supabase/migrations", migrationName);
const recoveryFile = path.join(
  repoRoot,
  "supabase/recovery/s3_reassert_clinical_suspension.sql",
);
const reportFile = path.join(
  __dirname,
  "clinical_surface_suspension.result.json",
);

const PATIENT = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const PROFESSIONAL = "33333333-3333-4333-8333-333333333333";
const NEW_USER = "44444444-4444-4444-8444-444444444444";
const INTAKE_KEEP = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const INTAKE_DELETE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const SHARE_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";

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

function assertNoDataChange(sql) {
  const stripped = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  if (
    /\b(insert\s+into|update\s+public\.|delete\s+from|truncate\s+)/i.test(
      stripped,
    )
  ) {
    throw new Error("S3 SQL contains a data-changing statement");
  }
}

async function run(db, sql) {
  try {
    const result = await db.query(sql);
    return { ok: true, rows: result.rows };
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
  if (role) {
    await db.exec(`set role ${role}`);
  }
}

function check(name, condition, detail) {
  return { name, ok: Boolean(condition), detail: detail ?? null };
}

async function privileges(db, table, grantee) {
  const result = await run(
    db,
    `
    select privilege_type
    from information_schema.table_privileges
    where table_schema = 'public'
      and table_name = ${sqlString(table)}
      and grantee = ${sqlString(grantee)}
    order by privilege_type
    `,
  );
  return result.rows.map((row) => row.privilege_type);
}

async function main() {
  const migrationSql = fs.readFileSync(migrationFile, "utf8");
  const recoverySql = fs.readFileSync(recoveryFile, "utf8");
  assertNoDataChange(migrationSql);
  assertNoDataChange(recoverySql);
  if (!migrationSql.includes("LOCK STATEMENTS BEGIN")) {
    throw new Error("migration is missing lock markers");
  }

  const db = new PGlite();
  await db.exec(`
    create role anon nologin nosuperuser nobypassrls;
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
    create schema if not exists auth;
    grant usage on schema auth to public, anon, authenticated, service_role;
    grant usage on schema public to anon, authenticated, service_role;
    create or replace function auth.uid()
    returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
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

    create table public.user_profiles (
      user_id uuid primary key,
      region_id text not null,
      daily_carb_goal_g integer,
      clinical_mode_enabled boolean not null default false,
      is_professional boolean not null default false
    );
    create table public.intake_entries (
      id uuid primary key,
      user_id uuid not null,
      food_id text not null,
      local_date date not null,
      carbs_g numeric not null
    );
    create table public.professional_report_shares (
      id uuid primary key,
      patient_user_id uuid not null,
      professional_user_id uuid not null,
      snapshot jsonb not null
    );
    create table public.patient_professional_contacts (
      patient_user_id uuid not null,
      professional_user_id uuid not null,
      label text not null,
      primary key (patient_user_id, professional_user_id)
    );
    create table public.professional_contact_messages (
      id uuid primary key,
      professional_user_id uuid not null,
      subject text not null,
      body text not null
    );

    alter table public.user_profiles enable row level security;
    alter table public.intake_entries enable row level security;
    alter table public.professional_report_shares enable row level security;
    alter table public.patient_professional_contacts enable row level security;
    alter table public.professional_contact_messages enable row level security;

    create policy "Users read own intake entries" on public.intake_entries
      for select to authenticated using (user_id = auth.uid());
    create policy "Users insert own intake entries" on public.intake_entries
      for insert to authenticated with check (user_id = auth.uid());
    create policy "Users update own intake entries" on public.intake_entries
      for update to authenticated using (user_id = auth.uid())
      with check (user_id = auth.uid());
    create policy "Users delete own intake entries" on public.intake_entries
      for delete to authenticated using (user_id = auth.uid());
    create policy "Patients read own report shares" on public.professional_report_shares
      for select to authenticated using (patient_user_id = auth.uid());
    create policy "Professionals read shares sent to them"
      on public.professional_report_shares
      for select to authenticated using (professional_user_id = auth.uid());
    create policy "Patients delete own report shares" on public.professional_report_shares
      for delete to authenticated using (patient_user_id = auth.uid());
    create policy "Patients read own professional contacts"
      on public.patient_professional_contacts
      for select to authenticated using (patient_user_id = auth.uid());
    create policy "Patients insert own professional contacts"
      on public.patient_professional_contacts
      for insert to authenticated with check (patient_user_id = auth.uid());
    create policy "Patients delete own professional contacts"
      on public.patient_professional_contacts
      for delete to authenticated using (patient_user_id = auth.uid());
    create policy "Professionals insert own contact messages"
      on public.professional_contact_messages
      for insert to authenticated with check (professional_user_id = auth.uid());
    create policy "Professionals read own contact messages"
      on public.professional_contact_messages
      for select to authenticated using (professional_user_id = auth.uid());
    create policy own_profile on public.user_profiles
      for all to authenticated using (user_id = auth.uid())
      with check (user_id = auth.uid());

    grant select, insert, update, delete on public.intake_entries
      to anon, authenticated, service_role;
    grant select, insert, update, delete on public.professional_report_shares
      to authenticated, service_role;
    grant select, insert, update, delete on public.patient_professional_contacts
      to authenticated, service_role;
    grant select, insert on public.professional_contact_messages
      to anon, authenticated;
    grant select, insert, update, delete on public.professional_contact_messages
      to service_role;
    grant select, insert, update, delete on public.user_profiles
      to authenticated, service_role;
  `);

  await db.exec(`
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled, is_professional
    ) values
      (${sqlString(PATIENT)}, 'es', 160, true, false),
      (${sqlString(OTHER)}, 'do', null, false, false),
      (${sqlString(PROFESSIONAL)}, 'es', null, false, true);
    insert into public.intake_entries (id, user_id, food_id, local_date, carbs_g) values
      (${sqlString(INTAKE_KEEP)}, ${sqlString(PATIENT)}, 'manzana', '2026-07-14', 12),
      (${sqlString(INTAKE_DELETE)}, ${sqlString(PATIENT)}, 'pan', '2026-07-14', 20);
    insert into public.professional_report_shares (
      id, patient_user_id, professional_user_id, snapshot
    ) values (
      ${sqlString(SHARE_ID)}, ${sqlString(PATIENT)}, ${sqlString(PROFESSIONAL)},
      '{"days":[{"date":"2026-07-14","totalCarbsG":12}]}'::jsonb
    );
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values (${sqlString(PATIENT)}, ${sqlString(PROFESSIONAL)}, 'otro');
    insert into public.professional_contact_messages (
      id, professional_user_id, subject, body
    ) values (
      ${sqlString(SHARE_ID)}, ${sqlString(PROFESSIONAL)}, 'consulta', 'texto de prueba'
    );
  `);

  const beforeCounts = await run(
    db,
    `
    select
      (select count(*) from public.intake_entries) as intake,
      (select count(*) from public.professional_report_shares) as shares,
      (select count(*) from public.patient_professional_contacts) as contacts,
      (select count(*) from public.professional_contact_messages) as messages,
      (select count(*) from public.user_profiles) as profiles
    `,
  );

  await db.exec(migrationSql);
  const intakePrivileges = await privileges(db, "intake_entries", "authenticated");
  await db.exec(recoverySql);

  const afterCounts = await run(
    db,
    `
    select
      (select count(*) from public.intake_entries) as intake,
      (select count(*) from public.professional_report_shares) as shares,
      (select count(*) from public.patient_professional_contacts) as contacts,
      (select count(*) from public.professional_contact_messages) as messages,
      (select count(*) from public.user_profiles) as profiles
    `,
  );

  await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
  const patientRead = await run(
    db,
    `select id::text from public.intake_entries order by id`,
  );
  const patientInsert = await run(
    db,
    `
    insert into public.intake_entries (id, user_id, food_id, local_date, carbs_g)
    values ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', ${sqlString(PATIENT)}, 'yogur', '2026-07-15', 6)
    `,
  );
  const patientUpdate = await run(
    db,
    `update public.intake_entries set carbs_g = 99 where id = ${sqlString(INTAKE_KEEP)}`,
  );
  const patientDelete = await run(
    db,
    `delete from public.intake_entries where id = ${sqlString(INTAKE_DELETE)}`,
  );
  const patientShareRead = await run(
    db,
    `select id::text from public.professional_report_shares`,
  );

  await setSession(db, {
    role: "authenticated",
    userId: PROFESSIONAL,
    jwtRole: "authenticated",
  });
  const professionalShareRead = await run(
    db,
    `select id::text from public.professional_report_shares`,
  );
  const messageRead = await run(
    db,
    `select subject from public.professional_contact_messages`,
  );
  const messageInsert = await run(
    db,
    `
    insert into public.professional_contact_messages (id, professional_user_id, subject, body)
    values ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', ${sqlString(PROFESSIONAL)}, 'nuevo', 'no')
    `,
  );

  await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
  const patientShareDelete = await run(
    db,
    `delete from public.professional_report_shares where id = ${sqlString(SHARE_ID)}`,
  );
  const regionUpdate = await run(
    db,
    `update public.user_profiles set region_id = 'do' where user_id = ${sqlString(PATIENT)}`,
  );
  const goalUpdate = await run(
    db,
    `update public.user_profiles set daily_carb_goal_g = 180 where user_id = ${sqlString(PATIENT)}`,
  );
  const clinicalOff = await run(
    db,
    `update public.user_profiles set clinical_mode_enabled = false where user_id = ${sqlString(PATIENT)}`,
  );

  await setSession(db, { role: "authenticated", userId: OTHER, jwtRole: "authenticated" });
  const crossRead = await run(
    db,
    `select id::text from public.intake_entries`,
  );
  const clinicalOn = await run(
    db,
    `update public.user_profiles set clinical_mode_enabled = true where user_id = ${sqlString(OTHER)}`,
  );
  await setSession(db, { role: "authenticated", userId: NEW_USER, jwtRole: "authenticated" });
  const newProfile = await run(
    db,
    `
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled
    ) values (${sqlString(NEW_USER)}, 'es', null, false)
    `,
  );
  await setSession(db, { role: "authenticated", userId: OTHER, jwtRole: "authenticated" });
  await setSession(db, {
    role: "authenticated",
    userId: "55555555-5555-4555-8555-555555555555",
    jwtRole: "authenticated",
  });
  const newProfileWithGoal = await run(
    db,
    `
    insert into public.user_profiles (
      user_id, region_id, daily_carb_goal_g, clinical_mode_enabled
    ) values ('55555555-5555-4555-8555-555555555555', 'es', 100, false)
    `,
  );

  await setSession(db, {});
  await db.exec("grant insert, update on public.intake_entries to authenticated");
  await db.exec(
    "grant insert, update on public.professional_report_shares to authenticated",
  );
  const ownerShareInsert = await run(
    db,
    `
    insert into public.professional_report_shares (
      id, patient_user_id, professional_user_id, snapshot
    ) values (
      'ffffffff-ffff-4fff-8fff-fffffffffff1', ${sqlString(PATIENT)}, ${sqlString(PROFESSIONAL)},
      '{"days":[]}'::jsonb
    )
    `,
  );
  await setSession(db, { role: "authenticated", userId: PATIENT, jwtRole: "authenticated" });
  const regrantInsert = await run(
    db,
    `
    insert into public.intake_entries (id, user_id, food_id, local_date, carbs_g)
    values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1', ${sqlString(PATIENT)}, 'lentejas', '2026-07-16', 24)
    `,
  );

  await setSession(db, { role: "service_role", userId: null, jwtRole: "service_role" });
  const serviceDelete = await run(
    db,
    `delete from public.professional_contact_messages where professional_user_id = ${sqlString(PROFESSIONAL)}`,
  );
  const serviceGoal = await run(
    db,
    `update public.user_profiles set daily_carb_goal_g = 140 where user_id = ${sqlString(OTHER)}`,
  );

  await setSession(db, { role: "anon", userId: null, jwtRole: "anon" });
  const anonInsert = await run(
    db,
    `
    insert into public.intake_entries (id, user_id, food_id, local_date, carbs_g)
    values ('99999999-9999-4999-8999-999999999999', ${sqlString(PATIENT)}, 'pan', '2026-07-14', 10)
    `,
  );

  await setSession(db, {});
  const policies = await run(
    db,
    `
    select c.relname as table_name, p.polname
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
    order by c.relname, p.polname
    `,
  );
  const policyNames = policies.rows.map((row) => `${row.table_name}:${row.polname}`);
  const finalCounts = await run(
    db,
    `
    select
      (select count(*) from public.intake_entries) as intake,
      (select carbs_g::text from public.intake_entries where id = ${sqlString(INTAKE_KEEP)}) as kept_carbs,
      (select region_id from public.user_profiles where user_id = ${sqlString(PATIENT)}) as patient_region,
      (select clinical_mode_enabled from public.user_profiles where user_id = ${sqlString(PATIENT)}) as patient_clinical,
      (select daily_carb_goal_g from public.user_profiles where user_id = ${sqlString(PATIENT)}) as patient_goal
    `,
  );

  const checks = [
    check(
      "historical rows survive the migration",
      beforeCounts.rows[0].intake === afterCounts.rows[0].intake &&
        beforeCounts.rows[0].shares === afterCounts.rows[0].shares &&
        beforeCounts.rows[0].contacts === afterCounts.rows[0].contacts &&
        beforeCounts.rows[0].messages === afterCounts.rows[0].messages,
      afterCounts.rows[0],
    ),
    check(
      "patient reads own intake",
      patientRead.ok && patientRead.rows.length === 2,
    ),
    check(
      "patient cannot insert intake",
      !patientInsert.ok && patientInsert.code === "42501",
      patientInsert,
    ),
    check(
      "patient cannot update intake",
      !patientUpdate.ok && patientUpdate.code === "42501",
      patientUpdate,
    ),
    check("patient can delete own intake", patientDelete.ok, patientDelete),
    check(
      "patient can read own share",
      patientShareRead.ok && patientShareRead.rows.length === 1,
    ),
    check("patient can delete own share", patientShareDelete.ok, patientShareDelete),
    check("region update stays allowed", regionUpdate.ok, regionUpdate),
    check(
      "carb goal change is rejected",
      !goalUpdate.ok && goalUpdate.code === "42501",
      goalUpdate,
    ),
    check("turning clinical mode off stays allowed", clinicalOff.ok, clinicalOff),
    check(
      "another user cannot read the intake",
      crossRead.ok && crossRead.rows.length === 0,
      crossRead,
    ),
    check(
      "turning clinical mode on is rejected",
      !clinicalOn.ok && clinicalOn.code === "42501",
      clinicalOn,
    ),
    check("educational profile insert stays allowed", newProfile.ok, newProfile),
    check(
      "new profile with a carb goal is rejected",
      !newProfileWithGoal.ok && newProfileWithGoal.code === "42501",
      newProfileWithGoal,
    ),
    check(
      "professional cannot read the share snapshot",
      professionalShareRead.ok && professionalShareRead.rows.length === 0,
      professionalShareRead,
    ),
    check(
      "professional can read an existing message",
      messageRead.ok && messageRead.rows.length === 1,
    ),
    check(
      "professional cannot insert a message",
      !messageInsert.ok && messageInsert.code === "42501",
      messageInsert,
    ),
    check(
      "re-granting insert does not reopen intake",
      !regrantInsert.ok && regrantInsert.code === "42501",
      regrantInsert,
    ),
    check(
      "a direct share insert stays rejected",
      !ownerShareInsert.ok && ownerShareInsert.code === "42501",
      ownerShareInsert,
    ),
    check("service role can delete messages", serviceDelete.ok, serviceDelete),
    check(
      "service role with a matching JWT can maintain a goal",
      serviceGoal.ok,
      serviceGoal,
    ),
    check("anon cannot insert intake", !anonInsert.ok, anonInsert),
    check(
      "professional read policy is gone",
      !policyNames.includes(
        "professional_report_shares:Professionals read shares sent to them",
      ),
      policyNames,
    ),
    check(
      "patient share read policy remains",
      policyNames.includes(
        "professional_report_shares:Patients read own report shares",
      ),
    ),
    check(
      "authenticated intake privileges are select and delete",
      intakePrivileges.join(",") === "DELETE,SELECT",
      intakePrivileges,
    ),
    check(
      "kept intake row is unchanged",
      finalCounts.rows[0].kept_carbs === "12" &&
        finalCounts.rows[0].patient_region === "do" &&
        finalCounts.rows[0].patient_clinical === false &&
        finalCounts.rows[0].patient_goal === 160,
      finalCounts.rows[0],
    ),
  ];

  const report = {
    migration: migrationName,
    sha256: crypto.createHash("sha256").update(migrationSql).digest("hex"),
    passed: checks.every((item) => item.ok),
    checks,
  };
  fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
  for (const item of checks) {
    console.log(`${item.ok ? "ok" : "FAIL"} ${item.name}`);
    if (!item.ok) console.log(JSON.stringify(item.detail));
  }
  if (!report.passed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
