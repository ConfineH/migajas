#!/usr/bin/env node
/**
 * Post-deploy smoke: Spain curriculum v2 markers (nivel 1 + nivel 4).
 * Usage: node scripts/ops-smoke-curriculum-v2.mjs [baseUrl]
 */
const site = process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://migajas.vercel.app";

function check(name, ok, detail) {
  console.log(`${ok ? "OK" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function setSpainOnboarding() {
  const response = await fetch(`${site}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      regionId: "es",
      guestMode: true,
      completed: true,
    }),
  });
  if (!response.ok) throw new Error(`onboarding ${response.status}`);
  const setCookie = response.headers.get("set-cookie") ?? "";
  return setCookie.split(";")[0];
}

async function main() {
  console.log(`=== Curriculum v2 smoke (${site}) ===`);
  let ok = true;
  const cookie = await setSpainOnboarding();

  const learn = await fetch(`${site}/learn`, { headers: { Cookie: cookie } });
  const learnHtml = await learn.text();
  ok = check("GET /learn", learn.ok, `status ${learn.status}`) && ok;
  ok =
    check(
      "Nivel 1 title",
      learnHtml.includes("Fundamentos") || learnHtml.includes("metabolismo"),
      "updated level name",
    ) && ok;
  ok =
    check(
      "Nivel 4 tapas theme",
      learnHtml.includes("tapas") ||
        learnHtml.includes("Fuera de casa") ||
        learnHtml.includes("cocina española"),
      "nivel 4 description",
    ) && ok;

  const nivel1 = await fetch(`${site}/learn/nivel-1`, {
    headers: { Cookie: cookie },
  });
  const n1Html = await nivel1.text();
  ok = check("GET /learn/nivel-1", nivel1.ok) && ok;
  ok =
    check(
      "Five lessons path",
      (n1Html.match(/l1-lesson-/g) ?? []).length >= 5 ||
        n1Html.includes("modulador") ||
        n1Html.includes("Fibra"),
      "nivel 1 expanded",
    ) && ok;

  const lesson3 = await fetch(`${site}/learn/nivel-1/lessons/l1-lesson-3`, {
    headers: { Cookie: cookie },
  });
  const l3Html = await lesson3.text();
  ok = check("GET l1-lesson-3 (moduladores)", lesson3.ok) && ok;
  ok =
    check(
      "Moduladores lesson",
      l3Html.includes("modulador") || l3Html.includes("0 raciones"),
      "lesson body",
    ) && ok;

  const lesson4n4 = await fetch(`${site}/learn/nivel-4/lessons/l4-lesson-3`, {
    headers: { Cookie: cookie },
  });
  const l43Html = await lesson4n4.text();
  ok = check("GET l4-lesson-3 (tapas)", lesson4n4.ok) && ok;
  ok =
    check(
      "Tapas lesson",
      l43Html.toLowerCase().includes("tapas") ||
        l43Html.toLowerCase().includes("bocadillo") ||
        l43Html.toLowerCase().includes("pizza"),
      "lesson body",
    ) && ok;

  const examStart = await fetch(`${site}/api/exam/start?levelId=nivel-1`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  ok =
    check(
      "Exam start route",
      examStart.status === 307 || examStart.status === 302,
      `status ${examStart.status}`,
    ) && ok;

  console.log(ok ? "\nCurriculum v2 smoke passed." : "\nCurriculum v2 smoke failed.");
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
