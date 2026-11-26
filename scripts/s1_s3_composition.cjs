const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const CLINICAL_MIGRATION = "20261125120000_suspend_clinical_surface.sql";
const REVIEWED_S2_SHA256 =
  "2ef608b27de85f5e5b2fcfd3852e3958651b6de57ff39690d6241b8213875fe6";

function clinicalMigrationPath(repoRoot) {
  return path.join(repoRoot, "supabase", "migrations", CLINICAL_MIGRATION);
}

function excludeFromInitialReplay(repoRoot, name, lockName) {
  if (name === lockName) return true;
  return (
    name === CLINICAL_MIGRATION &&
    fs.existsSync(clinicalMigrationPath(repoRoot))
  );
}

function readReviewedS2(repoRoot) {
  const file = path.join(
    repoRoot,
    "scripts",
    "fixtures",
    "s2_suspend_professional_shares.sql",
  );
  const sql = fs.readFileSync(file);
  const hash = crypto.createHash("sha256").update(sql).digest("hex");
  if (hash !== REVIEWED_S2_SHA256) {
    throw new Error(
      `S2 fixture hash ${hash} does not match the reviewed migration`,
    );
  }
  return sql.toString("utf8");
}

function historicalRowsSql(patient, professional) {
  return `
    insert into public.foods (
      id, country, category, name, portion_text, grams, carbs_g, difficulty, item_type
    ) values (
      's1-s3-fixture-food', 'España', 'test', 'fixture', '1', 100, 10, 'Baja', 'base'
    ) on conflict (id) do nothing;
    insert into public.intake_entries (
      user_id, food_id, meal_slot, local_date, carbs_g, rations
    ) values (
      '${patient}', 's1-s3-fixture-food', 'comida', '2026-01-01', 10, 1
    );
    insert into public.professional_report_shares (
      professional_user_id, patient_user_id, range_from, range_to, snapshot
    ) values (
      '${professional}', '${patient}', '2026-01-01', '2026-01-02', '{"fixture":true}'::jsonb
    );
    insert into public.patient_professional_contacts (
      patient_user_id, professional_user_id, label
    ) values (
      '${patient}', '${professional}', 'educacion_diabetes'
    );
  `;
}

function snapshotSql() {
  return `
    select
      (select count(*) from public.user_profiles) as profiles,
      (select count(*) from public.intake_entries) as intake,
      (select count(*) from public.professional_report_shares) as shares,
      (select count(*) from public.patient_professional_contacts) as contacts,
      (select md5(string_agg(
        user_id::text || '|' || coalesce(daily_carb_goal_g::text, '') || '|' ||
        clinical_mode_enabled::text || '|' || is_professional::text,
        ',' order by user_id::text
      )) from public.user_profiles) as profile_fp
  `;
}

function probeSql(patient, professional) {
  return `
    drop table if exists public.s1_composition_probe;
    create table public.s1_composition_probe (
      name text primary key,
      ok boolean not null,
      detail text
    );

    insert into public.s1_composition_probe (name, ok, detail)
    values
      (
        's1 trigger stays enabled',
        exists (
          select 1 from pg_trigger
          where tgname = 'protect_user_profile_professional_columns'
            and tgenabled = 'O'
            and not tgisinternal
        ),
        null
      ),
      (
        'export and delete rights remain',
        has_table_privilege('authenticated', 'public.user_profiles', 'SELECT')
          and has_table_privilege('authenticated', 'public.intake_entries', 'SELECT')
          and has_table_privilege('authenticated', 'public.intake_entries', 'DELETE')
          and has_table_privilege('authenticated', 'public.professional_report_shares', 'SELECT')
          and has_table_privilege('authenticated', 'public.professional_report_shares', 'DELETE')
          and has_table_privilege('authenticated', 'public.patient_professional_contacts', 'SELECT')
          and has_table_privilege('authenticated', 'public.patient_professional_contacts', 'DELETE')
          and has_table_privilege('service_role', 'public.intake_entries', 'DELETE')
          and has_table_privilege('service_role', 'public.professional_report_shares', 'DELETE')
          and has_table_privilege('service_role', 'public.patient_professional_contacts', 'DELETE'),
        null
      ),
      (
        's2 execute and insert stay revoked',
        not has_table_privilege('authenticated', 'public.patient_professional_contacts', 'INSERT')
          and not has_table_privilege('authenticated', 'public.professional_report_shares', 'INSERT')
          and not has_table_privilege('authenticated', 'public.intake_entries', 'INSERT')
          and not has_table_privilege('anon', 'public.patient_professional_contacts', 'SELECT')
          and not has_function_privilege(
            'authenticated',
            'public.share_report_with_professional(text,date,date,jsonb)',
            'EXECUTE'
          )
          and not has_function_privilege(
            'anon',
            'public.share_report_with_professional(text,date,date,jsonb)',
            'EXECUTE'
          )
          and not has_function_privilege(
            'public',
            'public.share_report_with_professional(text,date,date,jsonb)',
            'EXECUTE'
          )
          and has_function_privilege(
            'authenticated',
            'public.list_patient_share_recipients()',
            'EXECUTE'
          ),
        null
      );

    do $probe$
    declare
      detail text;
    begin
      begin
        execute 'set local role authenticated';
        perform set_config('request.jwt.claim.sub', '${patient}', true);
        perform set_config('request.jwt.claim.role', 'authenticated', true);
        update public.user_profiles
        set is_professional = true
        where user_id = '${patient}';
        insert into public.s1_composition_probe (name, ok, detail)
        values ('s1 still locks professional columns', false, 'update succeeded');
      exception when others then
        get stacked diagnostics detail = message_text;
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          's1 still locks professional columns',
          detail like '%professional profile columns are locked%',
          detail
        );
      end;

      begin
        execute 'set local role authenticated';
        perform set_config('request.jwt.claim.sub', '${professional}', true);
        perform set_config('request.jwt.claim.role', 'authenticated', true);
        update public.user_profiles
        set daily_carb_goal_g = coalesce(daily_carb_goal_g, 0) + 1
        where user_id = '${professional}';
        insert into public.s1_composition_probe (name, ok, detail)
        values ('s3 still suspends clinical columns', false, 'update succeeded');
      exception when others then
        get stacked diagnostics detail = message_text;
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          's3 still suspends clinical columns',
          detail like '%clinical profile columns are suspended%',
          detail
        );
      end;

      begin
        insert into public.intake_entries (
          user_id, food_id, meal_slot, local_date, carbs_g, rations
        ) values (
          '${patient}', 's1-s3-fixture-food', 'comida', '2026-01-02', 10, 1
        );
        insert into public.s1_composition_probe (name, ok, detail)
        values ('s3 still rejects new intake', false, 'insert succeeded');
      exception when others then
        get stacked diagnostics detail = message_text;
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          's3 still rejects new intake',
          detail like '%suspended%',
          detail
        );
      end;

      begin
        execute 'set local role authenticated';
        perform set_config('request.jwt.claim.sub', '${patient}', true);
        perform set_config('request.jwt.claim.role', 'authenticated', true);
        delete from public.intake_entries
        where user_id = '${patient}' and food_id = 's1-s3-fixture-food';
        execute 'reset role';
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          'patient can still delete historical intake',
          not exists (
            select 1 from public.intake_entries
            where user_id = '${patient}' and food_id = 's1-s3-fixture-food'
          ),
          null
        );
      exception when others then
        get stacked diagnostics detail = message_text;
        execute 'reset role';
        insert into public.s1_composition_probe (name, ok, detail)
        values ('patient can still delete historical intake', false, detail);
      end;

      begin
        execute 'set local role service_role';
        perform set_config('request.jwt.claim.role', 'service_role', true);
        delete from public.professional_report_shares
        where patient_user_id = '${patient}' and snapshot = '{"fixture":true}'::jsonb;
        delete from public.patient_professional_contacts
        where patient_user_id = '${patient}'
          and professional_user_id = '${professional}';
        execute 'reset role';
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          'service role can still delete historical shares and contacts',
          not exists (
            select 1 from public.professional_report_shares
            where patient_user_id = '${patient}' and snapshot = '{"fixture":true}'::jsonb
          )
          and not exists (
            select 1 from public.patient_professional_contacts
            where patient_user_id = '${patient}'
              and professional_user_id = '${professional}'
          ),
          null
        );
      exception when others then
        get stacked diagnostics detail = message_text;
        execute 'reset role';
        insert into public.s1_composition_probe (name, ok, detail)
        values (
          'service role can still delete historical shares and contacts',
          false,
          detail
        );
      end;
    end
    $probe$;

  `;
}

async function runS2S3Composition({ exec, query, repoRoot, patient, professional }) {
  if (!fs.existsSync(clinicalMigrationPath(repoRoot))) return [];
  const checks = [];
  try {
    await exec(historicalRowsSql(patient, professional));
    const before = await query(snapshotSql());
    await exec(readReviewedS2(repoRoot));
    await exec(fs.readFileSync(clinicalMigrationPath(repoRoot), "utf8"));
    const after = await query(snapshotSql());
    checks.push([
      "s2 and s3 do not change historical rows",
      JSON.stringify(before) === JSON.stringify(after),
    ]);
    await exec(probeSql(patient, professional));
    const probes = await query(
      "select name, ok, detail from public.s1_composition_probe order by name",
    );
    for (const probe of probes) {
      if (probe.ok !== true) {
        console.error(`composition probe failed ${probe.name}: ${probe.detail}`);
      }
      checks.push([probe.name, probe.ok === true]);
    }
  } catch (error) {
    checks.push([
      "s2 remains effective after s3",
      false,
    ]);
    checks.push([
      String(error.message || error).split("\n")[0],
      false,
    ]);
  }
  return checks;
}

module.exports = {
  excludeFromInitialReplay,
  runS2S3Composition,
};
