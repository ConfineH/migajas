/**
 * Integración del profesional: indica la práctica entre consultas.
 * No es un directorio de proveedores.
 */

export const PROFESSIONAL_PAGE = {
  path: "/profesionales",
  title: "Para profesionales de la salud — Migajas",
  description:
    "Curso de conteo de carbohidratos para indicar entre consultas. Para endocrinología, nutrición, atención primaria, educación diabetológica y programas públicos de salud.",
  eyebrow: "Profesionales de la salud",
  headline: "Tú indicas el curso. La consulta sigue siendo tuya.",
  lead: "Migajas es un curso en la web para practicar el conteo de carbohidratos con la comida de cada país. Complementa la educación diabetológica; no la sustituye.",
  ctaPrimary: "Ver el curso",
  ctaSecondary: "Crear perfil profesional",
  audienceHeading: "A quiénes nos dirigimos",
  audienceLead:
    "Nos referimos a quien enseña el conteo en consulta y a las entidades públicas que coordinan esa educación. No a un directorio de citas.",
} as const;

export const PROFESSIONAL_AUDIENCES = [
  {
    title: "Endocrinología",
    body: "Dejas la práctica del conteo entre visitas y, en la siguiente consulta, ves si la persona ha trabajado.",
  },
  {
    title: "Nutrición clínica",
    body: "Pones deberes entre citas: raciones y comida cotidiana, para que cada visita rinda más.",
  },
  {
    title: "Medicina de familia o de cabecera",
    body: "Indicas el curso cuando no hay tiempo en consulta para enseñar raciones.",
  },
  {
    title: "Enfermería y educación diabetológica",
    body: "Complementas el taller presencial con un hilo de cinco niveles que la persona sigue en casa.",
  },
  {
    title: "Entidades públicas de salud",
    body: "Ministerios, servicios de salud y programas de crónicos ven cifras agregadas y anónimas: cuántas personas empezaron y cuántas aprobaron el nivel 1. Invierten en prevención y en educación, no en un listado de consultas.",
  },
] as const;

export const PROFESSIONAL_CYCLE_STEPS = [
  {
    title: "Primera consulta",
    body: "Indicas el curso: un enlace o un código QR. Es la tarea entre visitas.",
  },
  {
    title: "Entre consultas",
    body: "La persona recorre los cinco niveles a su ritmo, con la comida de su país.",
  },
  {
    title: "Siguiente consulta",
    body: "Preguntas en qué nivel va. Si ha activado el diario de conteo de carbohidratos, puede enviarte un informe.",
  },
  {
    title: "El programa",
    body: "Quien coordina el servicio ve cifras agregadas y anónimas: cuántas personas empezaron y cuántas aprobaron el nivel 1.",
  },
] as const;

/** Complementos de «el profesional puede». Infinitivos paralelos. */
export const PROFESSIONAL_CAN = [
  "Indicar el curso, como hoy indica la educación alimentaria.",
  "Preguntar en la siguiente visita: «¿En qué nivel vas?»",
  "Revisar el contenido del curso y los informes que la persona le envíe.",
  "Escribir al equipo de Migajas desde su perfil.",
] as const;

/** Predicados de «Migajas no…». Tercera persona, mismas formas. */
export const PROFESSIONAL_CANNOT = [
  "No abre el diario de conteo de carbohidratos sin el consentimiento de la persona.",
  "No envía datos a la historia clínica.",
  "No indica dosis ni modifica el tratamiento.",
] as const;

export const PROFESSIONAL_SCRIPT =
  "Te dejo Migajas, un curso corto para practicar las raciones con comida local. No sustituye lo que hablamos hoy. Empieza por el nivel 1; en la próxima consulta me dices cómo te fue.";

export const PROFESSIONAL_NOT_DIRECTORY =
  "Migajas no publica un directorio de profesionales ni concierta citas. Quien enseña entra para indicar la práctica, no para anunciarse.";

export const CONSULT_VISIT_COPY = {
  title: "Para tu próxima consulta",
  empty:
    "Cuando apruebes un nivel, coméntaselo a tu médico, a tu nutricionista o a tu endocrino. Migajas es la práctica entre visitas.",
  withLevel: (levelName: string) =>
    `En la próxima consulta puedes decir: voy por el ${levelName}. Es la práctica entre visitas; las decisiones de tratamiento las tomas con tu equipo de salud.`,
  examPassed: (levelName: string) =>
    `En la próxima consulta puedes decir que aprobaste el ${levelName}.`,
} as const;

export function latestPassedLevelName(
  completions: ReadonlyArray<{ levelId: string; passed: boolean }>,
  levels: ReadonlyArray<{ id: string; name: string }>,
): string | null {
  const passedIds = new Set(
    completions.filter((entry) => entry.passed).map((entry) => entry.levelId),
  );

  for (let index = levels.length - 1; index >= 0; index -= 1) {
    const level = levels[index];
    if (level && passedIds.has(level.id)) {
      return level.name;
    }
  }

  return null;
}

export function consultVisitBody(passedLevelName: string | null): string {
  return passedLevelName
    ? CONSULT_VISIT_COPY.withLevel(passedLevelName)
    : CONSULT_VISIT_COPY.empty;
}
