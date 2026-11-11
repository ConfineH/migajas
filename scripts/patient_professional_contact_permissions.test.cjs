const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { PGlite } = require("@electric-sql/pglite");

// In-memory Postgres only. Requires @electric-sql/pglite on NODE_PATH.
// Does not connect to Supabase and does not read production data.
const repoRoot = path.resolve(__dirname, "..");
const repoMigrations = path.join(repoRoot, "supabase", "migrations");
const fixName = "20261110230000_fix_patient_professional_contact_permissions.sql";
const fixFile = path.join(repoMigrations, fixName);
const reportFile = path.join(__dirname, "patient_professional_contact_permissions.result.json");

const P1 = "11111111-1111-4111-8111-111111111111";
const P2 = "22222222-2222-4222-8222-222222222222";
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function shortError(error) {
  return {
    ok: false,
    code: error.code || null,
    message: String(error.message || error).split("\n")[0],
  };
}

async function run(db, sql) {
  try {
    const result = await db.query(sql);
    return {
      ok: true,
      code: null,
      message: null,
      affected: result.affectedRows ?? null,
      rows: result.rows,
    };
  } catch (error) {
    return { ...shortError(error), affected: null, rows: [] };
  }
}

async function become(db, userId) {
  if (!userId) {
    await db.exec("reset role");
    return;
  }
  await db.exec(`
    reset role;
    select set_config('request.jwt.claim.sub', '${userId}', false);
    select set_config(
      'request.jwt.claims',
      '{"sub":"${userId}","role":"authenticated"}',
      false
    );
    set role authenticated;
  `);
}

async function main() {
  const db = new PGlite();
  const version = await db.query("select version()");
  const findings = [];

  await db.exec(`
    create role anon nologin nosuperuser nobypassrls;
    create role authenticated nologin nosuperuser nobypassrls;
    create role service_role nologin nosuperuser bypassrls;
    create schema auth;
    grant usage on schema auth to public, anon, authenticated, service_role;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant execute on function auth.uid() to public, anon, authenticated, service_role;
  `);

  const files = fs
    .readdirSync(repoMigrations)
    .filter((name) => name.endsWith(".sql") && name !== fixName)
    .sort();
  const migrationNotes = [];
  for (const name of files) {
    const sql = fs.readFileSync(path.join(repoMigrations, name), "utf8");
    try {
      await db.exec(sql);
      console.log(`migration ok ${name}`);
    } catch (error) {
      const failure = shortError(error);
      const replayGap =
        name === "20260713160000_seed_content.sql" ||
        name === "20260714160300_lock_admin_rpc.sql";
      if (replayGap) {
        migrationNotes.push({
          file: name,
          applied: false,
          ...failure,
        });
        console.log(`migration skipped ${name}: ${failure.message}`);
        continue;
      }
      console.error(`migration failed ${name}`);
      console.error(failure.message);
      process.exit(1);
    }
  }

  await become(db, null);
  try {
    await db.exec(`
      insert into auth.users (id, email, raw_user_meta_data) values
        ('${P1}', 'p1@example.test', '{"full_name":"Paciente Uno"}'),
        ('${P2}', 'p2@example.test', '{"full_name":"Paciente Dos"}'),
        ('${A}', 'a@example.test', '{"full_name":"Profesional A"}'),
        ('${B}', 'b@example.test', '{"full_name":"Profesional B"}');
      insert into public.user_profiles (
        user_id, is_professional, professional_role, professional_share_code
      ) values
        ('${P1}', false, null, null),
        ('${P2}', false, null, null),
        ('${A}', true, 'endocrinologia', 'AAAAAA'),
        ('${B}', true, 'nutricion', 'BBBBBB');
      insert into public.professional_report_shares (
        professional_user_id, patient_user_id, range_from, range_to, snapshot
      ) values (
        '${A}', '${P1}', '2026-01-01', '2026-01-31',
        '{"fixture":"p1-a","note":"datos ficticios"}'::jsonb
      );
    `);
  } catch (error) {
    console.error("seed failed", shortError(error));
    process.exit(1);
  }

  await become(db, P1);
  const identity = await run(
    db,
    `
    select current_user,
           auth.uid()::text as uid,
           (select rolbypassrls from pg_roles where rolname = current_user) as bypass
    `,
  );
  console.log("identity", JSON.stringify(identity.rows));
  if (
    !identity.ok ||
    identity.rows[0].current_user !== "authenticated" ||
    identity.rows[0].uid !== P1 ||
    identity.rows[0].bypass !== false
  ) {
    console.error("RLS identity is not valid", identity);
    process.exit(1);
  }

  const oldP1toB = await run(
    db,
    `
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values ('${P1}', '${B}', 'otro')
    returning patient_user_id::text, professional_user_id::text
    `,
  );
  findings.push({ case: "before-fix P1 inserts contact B while only share is P1-A", ...oldP1toB, rows: oldP1toB.rows });

  await become(db, P2);
  const oldP2 = await run(
    db,
    `
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values ('${P2}', '${B}', 'otro')
    returning patient_user_id::text, professional_user_id::text
    `,
  );
  findings.push({
    case: "before-fix P2 inserts contact B with no share visible to P2",
    ...oldP2,
    rows: oldP2.rows,
  });

  await become(db, null);
  await db.exec("delete from public.patient_professional_contacts");
  await db.exec(fs.readFileSync(fixFile, "utf8"));
  const policy = await run(
    db,
    `
    select pg_get_expr(polwithcheck, polrelid) as with_check
    from pg_policy
    where polname = 'Patients insert own professional contacts'
    `,
  );

  await become(db, P1);
  const allowed = await run(
    db,
    `
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values ('${P1}', '${A}', 'endocrinologia')
    returning patient_user_id::text, professional_user_id::text, label
    `,
  );
  findings.push({ case: "1 allowed P1-A", ...allowed, rows: allowed.rows });

  const denied = await run(
    db,
    `
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values ('${P1}', '${B}', 'nutricion')
    returning professional_user_id::text
    `,
  );
  findings.push({ case: "2 denied P1-B with only P1-A share", ...denied, rows: denied.rows });

  await become(db, null);
  await db.exec(`
    insert into public.professional_report_shares (
      professional_user_id, patient_user_id, range_from, range_to, snapshot
    ) values (
      '${B}', '${P2}', '2026-01-01', '2026-01-31',
      '{"fixture":"p2-b","note":"datos ficticios"}'::jsonb
    );
  `);
  await become(db, P1);
  const deniedAfterOther = await run(
    db,
    `
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values ('${P1}', '${B}', 'nutricion')
    returning professional_user_id::text
    `,
  );
  findings.push({
    case: "3 denied P1-B after unrelated P2-B share",
    ...deniedAfterOther,
    rows: deniedAfterOther.rows,
  });

  const edited = await run(
    db,
    `
    update public.patient_professional_contacts
    set label = 'educacion_diabetes',
        repeat_mode = 'monthly',
        repeat_due_at = '2026-12-01T00:00:00Z',
        updated_at = now()
    where patient_user_id = '${P1}'
      and professional_user_id = '${A}'
    returning label, repeat_mode
    `,
  );
  findings.push({ case: "4 edit label and reminder", ...edited, rows: edited.rows });

  const removed = await run(
    db,
    `
    delete from public.professional_report_shares
    where patient_user_id = '${P1}' and professional_user_id = '${A}'
    returning id::text
    `,
  );
  const editedAfterDelete = await run(
    db,
    `
    update public.patient_professional_contacts
    set label = 'medicina_familia',
        repeat_mode = 'next_month',
        repeat_due_at = '2026-12-15T00:00:00Z',
        updated_at = now()
    where patient_user_id = '${P1}'
      and professional_user_id = '${A}'
    returning label, repeat_mode
    `,
  );
  findings.push({
    case: "5 edit after deleting share",
    delete: { ok: removed.ok, code: removed.code, message: removed.message, affected: removed.affected, rows: removed.rows },
    ...editedAfterDelete,
    rows: editedAfterDelete.rows,
  });

  const reassigned = await run(
    db,
    `
    update public.patient_professional_contacts
    set professional_user_id = '${B}'
    where patient_user_id = '${P1}'
      and professional_user_id = '${A}'
    returning professional_user_id::text
    `,
  );
  await become(db, null);
  const afterReassign = await run(
    db,
    `
    select professional_user_id::text, label, repeat_mode
    from public.patient_professional_contacts
    where patient_user_id = '${P1}'
    `,
  );
  findings.push({
    case: "6 reassign own contact",
    ...reassigned,
    rows: reassigned.rows,
    remaining: afterReassign.rows,
  });

  await become(db, P2);
  const crossEdit = await run(
    db,
    `
    update public.patient_professional_contacts
    set label = 'otro'
    where patient_user_id = '${P1}'
      and professional_user_id = '${A}'
    returning label
    `,
  );
  await become(db, null);
  const afterCross = await run(
    db,
    `
    select label
    from public.patient_professional_contacts
    where patient_user_id = '${P1}' and professional_user_id = '${A}'
    `,
  );
  findings.push({
    case: "7 P2 edits P1 contact",
    ...crossEdit,
    rows: crossEdit.rows,
    remaining: afterCross.rows,
  });

  await become(db, P1);
  const shared = await run(
    db,
    `
    select public.share_report_with_professional(
      'BBBBBB',
      '2026-02-01'::date,
      '2026-02-28'::date,
      '{"fixture":"primer-envio","note":"datos ficticios"}'::jsonb
    )::text as id
    `,
  );
  await become(db, null);
  const created = await run(
    db,
    `
    select s.id::text as share_id,
           s.patient_user_id::text as patient,
           s.professional_user_id::text as professional,
           c.label
    from public.professional_report_shares s
    join public.patient_professional_contacts c
      on c.patient_user_id = s.patient_user_id
     and c.professional_user_id = s.professional_user_id
    where s.patient_user_id = '${P1}'
      and s.professional_user_id = '${B}'
      and s.snapshot ->> 'fixture' = 'primer-envio'
    `,
  );
  const reads = {};
  for (const [name, id] of [["P1", P1], ["B", B], ["P2", P2], ["A", A]]) {
    await become(db, id);
    const seen = await run(
      db,
      `
      select id::text
      from public.professional_report_shares
      where patient_user_id = '${P1}'
        and professional_user_id = '${B}'
        and snapshot ->> 'fixture' = 'primer-envio'
      `,
    );
    reads[name] = seen.ok ? seen.rows.map((row) => row.id) : seen;
  }
  findings.push({
    case: "8 first share with B",
    ...shared,
    rows: shared.rows,
    created: created.rows,
    reads,
  });

  await become(db, P1);
  const executeAsPatient = await run(
    db,
    "select public.prevent_patient_professional_contact_reassignment()",
  );
  await become(db, null);
  await db.exec("set role anon");
  const executeAsAnon = await run(
    db,
    "select public.prevent_patient_professional_contact_reassignment()",
  );
  findings.push({
    case: "9 trigger function is not directly executable",
    authenticated: { ok: executeAsPatient.ok, code: executeAsPatient.code, message: executeAsPatient.message },
    anon: { ok: executeAsAnon.ok, code: executeAsAnon.code, message: executeAsAnon.message },
  });

  const checks = [
    ["1 insert P1-A", allowed.ok === true && allowed.rows.length === 1],
    ["2 deny P1-B", denied.ok === false && denied.code === "42501"],
    ["3 deny P1-B after P2-B", deniedAfterOther.ok === false && deniedAfterOther.code === "42501"],
    ["4 edit reminder", edited.ok === true && edited.rows[0]?.label === "educacion_diabetes" && edited.rows[0]?.repeat_mode === "monthly"],
    ["5 edit after delete", removed.ok === true && removed.rows.length === 1 && editedAfterDelete.ok === true && editedAfterDelete.rows[0]?.label === "medicina_familia"],
    ["6 reassign returns 23514 and keeps A", reassigned.ok === false && reassigned.code === "23514" && afterReassign.rows.length === 1 && afterReassign.rows[0].professional_user_id === A],
    ["7 cross-patient update changes zero rows", crossEdit.ok === true && crossEdit.rows.length === 0 && afterCross.rows[0]?.label === "medicina_familia"],
    ["8 share creates P1-B report and nutricion contact", shared.ok === true && created.rows.length === 1 && created.rows[0].patient === P1 && created.rows[0].professional === B && created.rows[0].label === "nutricion"],
    ["8 P1 and B can read; P2 and A cannot", reads.P1.length === 1 && reads.B.length === 1 && reads.P2.length === 0 && reads.A.length === 0],
    ["9 execute revoked", executeAsPatient.code === "42501" && executeAsAnon.code === "42501"],
  ];

  const report = {
    engine: version.rows[0].version,
    repoCommit: execSync("git rev-parse HEAD", {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim(),
    migrations: files,
    migrationNotes,
    fixFile: path.relative(repoRoot, fixFile),
    identity: identity.rows[0],
    policyWithCheck: policy.rows[0]?.with_check ?? null,
    findings,
    checks,
    passed: checks.every(([, ok]) => ok),
  };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks, policy: report.policyWithCheck }, null, 2));
  await db.close();
  process.exit(report.passed ? 0 : 1);
}

main().catch((error) => {
  console.error(shortError(error).message);
  process.exit(1);
});
