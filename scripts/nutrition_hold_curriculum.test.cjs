const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { PGlite } = require("@electric-sql/pglite");

const repoRoot = path.resolve(__dirname, "..");
const migrationFile = path.join(
  repoRoot,
  "supabase/migrations/20261126190000_hold_unreviewed_nutrition_examples.sql",
);
const fixtureFile = path.join(
  __dirname,
  "fixtures/n9_production_curriculum.json",
);
const authorizedHash =
  "6b09adf5b169ca15dc154894f6ad995f7b3fc5141dba628f5a5f751026231dcd";

const checks = [];

function check(name, ok) {
  checks.push([name, Boolean(ok)]);
}

async function schema(db) {
  await db.exec(`
    create table public.lessons (
      id text primary key,
      level_id text,
      order_index integer,
      title text,
      summary text,
      steps jsonb not null,
      updated_at timestamptz
    );
    create table public.level_exams (
      level_id text primary key,
      title text,
      description text,
      exercise_ids jsonb not null,
      pool_exercise_ids jsonb not null,
      questions_per_exam integer,
      updated_at timestamptz
    );
    create table public.foods (
      id text primary key,
      carbs numeric
    );
    create table public.user_learning_state (
      user_id uuid primary key,
      progress jsonb,
      attempts jsonb
    );
  `);
}

function sqlText(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function loadCurriculum(db, snapshot) {
  for (const lesson of snapshot.lessons) {
    await db.exec(`
      insert into public.lessons
        (id, level_id, order_index, title, summary, steps, updated_at)
      values (
        ${sqlText(lesson.id)},
        ${sqlText(lesson.level_id)},
        ${Number(lesson.order_index)},
        ${sqlText(lesson.title)},
        ${sqlText(lesson.summary ?? "")},
        ${sqlText(JSON.stringify(lesson.steps))}::jsonb,
        ${sqlText(lesson.updated_at)}
      );
    `);
  }
  const exam = snapshot.exam;
  await db.exec(`
    insert into public.level_exams
      (level_id, title, description, exercise_ids, pool_exercise_ids,
       questions_per_exam, updated_at)
    values (
      'nivel-2',
      ${sqlText(exam.title)},
      ${sqlText(exam.description ?? "")},
      ${sqlText(JSON.stringify(exam.exercise_ids))}::jsonb,
      ${sqlText(JSON.stringify(exam.pool_exercise_ids))}::jsonb,
      ${Number(exam.questions_per_exam)},
      ${sqlText(exam.updated_at)}
    );
  `);
  await db.exec(`
    insert into public.lessons
      (id, level_id, order_index, title, summary, steps, updated_at)
    values (
      'untouched-lesson', 'nivel-1', 1, 'Untouched', '',
      '[{"id":"keep","foodId":"pan","body":"45 g"}]'::jsonb, now()
    );
    insert into public.foods (id, carbs) values ('pan-integral-100g', 45);
    insert into public.user_learning_state (user_id, progress, attempts)
    values (
      '11111111-1111-4111-8111-111111111111',
      '{"completions":[{"levelId":"nivel-2"}]}'::jsonb,
      '[{"exerciseId":"n2-ex6","isCorrect":false},{"exerciseId":"n2-ex7","isCorrect":true}]'::jsonb
    );
  `);
}

async function stepMap(db) {
  const result = await db.query(`
    select lesson.id as lesson_id, step->>'id' as step_id,
      step ? 'foodId' as has_food,
      step->>'exerciseId' as exercise_id,
      step->>'body' as body
    from public.lessons lesson
    cross join lateral jsonb_array_elements(lesson.steps) step
  `);
  return result.rows;
}

async function main() {
  const migrationSql = fs.readFileSync(migrationFile);
  const hash = crypto.createHash("sha256").update(migrationSql).digest("hex");
  check("SQL hash matches the authorized file", hash === authorizedHash);

  const snapshot = JSON.parse(fs.readFileSync(fixtureFile, "utf8"));
  check("fixture has the four production lessons", snapshot.lessons.length === 4);
  check(
    "fixture pool is the production pool of 12",
    snapshot.exam.pool_exercise_ids.length === 12 &&
      snapshot.exam.questions_per_exam === 4,
  );

  const db = new PGlite();
  await schema(db);
  await loadCurriculum(db, snapshot);
  const before = await stepMap(db);
  const heldBefore = before.filter((row) =>
    [
      "l1-lesson-2-s4",
      "l1-lesson-5-s3",
      "l2-lesson-2-s1a",
      "l2-lesson-2-s3",
      "l2-lesson-3-s1",
      "l2-lesson-3-s2",
    ].includes(row.step_id),
  );
  check(
    "production steps start linked to a food card",
    heldBefore.length === 6 && heldBefore.every((row) => row.has_food === true),
  );

  await db.exec(migrationSql.toString("utf8"));
  const after = await stepMap(db);
  const byId = new Map(after.map((row) => [row.step_id, row]));

  check("label step no longer points at a food card", byId.get("l1-lesson-2-s4")?.has_food === false);
  check("milk step stays a lesson step", byId.get("l1-lesson-5-s3")?.lesson_id === "l1-lesson-5");
  check("roasted potato card is withdrawn", byId.get("l2-lesson-2-s1a")?.has_food === false);
  check(
    "roasted potato is marked as under review",
    String(byId.get("l2-lesson-2-s1a")?.body || "").includes("en revisión"),
  );
  check("instant mash card is withdrawn", byId.get("l2-lesson-2-s3")?.has_food === false);
  check("lentil card is withdrawn", byId.get("l2-lesson-3-s1")?.has_food === false);
  check("chickpea card is withdrawn", byId.get("l2-lesson-3-s2")?.has_food === false);
  check(
    "legume practice points at the label exercise",
    byId.get("l2-lesson-3-practice")?.exercise_id === "ex-l2-3-label-rations",
  );
  check(
    "an unrelated lesson is unchanged",
    byId.get("keep")?.has_food === true && byId.get("keep")?.body === "45 g",
  );

  const pool = await db.query(
    "select pool_exercise_ids, exercise_ids, questions_per_exam from public.level_exams where level_id = 'nivel-2'",
  );
  const ids = pool.rows[0].pool_exercise_ids;
  check("exam length and question count stay 12 and 4", ids.length === 12 && pool.rows[0].questions_per_exam === 4);
  check(
    "pool and exercise list stay aligned",
    JSON.stringify(ids) === JSON.stringify(pool.rows[0].exercise_ids),
  );
  for (const [oldId, newId] of [
    ["ex-l2-3-legumes-counting", "ex-l2-3-label-rations"],
    ["n2-ex6", "n2-ex6-legume-identify"],
    ["n2-ex7", "n2-ex7-label-rations"],
    ["n2-ex9", "n2-ex9-label-rations"],
  ]) {
    check(`pool replaces ${oldId}`, !ids.includes(oldId) && ids.includes(newId));
  }
  for (const kept of ["n2-ex4", "n2-ex5", "n2-ex8", "n2-ex10", "n2-ex11", "n2-ex12", "ex-l2-1-rice-pasta-portions", "ex-l2-2-potato-sweet-potato"]) {
    check(`pool keeps ${kept}`, ids.includes(kept));
  }

  const preserved = await db.query(`
    select
      (select carbs::text from public.foods where id = 'pan-integral-100g') as carbs,
      (select attempts::text from public.user_learning_state) as attempts,
      (select progress::text from public.user_learning_state) as progress
  `);
  check(
    "foods, attempts, and completions are not rewritten",
    preserved.rows[0].carbs === "45" &&
      preserved.rows[0].attempts.includes("n2-ex6") &&
      preserved.rows[0].attempts.includes("n2-ex7") &&
      preserved.rows[0].progress.includes("nivel-2"),
  );

  const empty = new PGlite();
  await schema(empty);
  let emptyRaised = false;
  try {
    await empty.exec(migrationSql.toString("utf8"));
  } catch {
    emptyRaised = true;
  }
  check("empty curriculum does not raise, so production rows must be proven first", emptyRaised === false);

  const rolled = new PGlite();
  await schema(rolled);
  await loadCurriculum(rolled, snapshot);
  await rolled.exec(`
    begin;
    ${migrationSql.toString("utf8")}
    rollback;
  `);
  const restored = await stepMap(rolled);
  const potato = restored.find((row) => row.step_id === "l2-lesson-2-s1a");
  check("rollback restores the potato card", potato?.has_food === true);

  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ passed: failed.length === 0, failed }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
