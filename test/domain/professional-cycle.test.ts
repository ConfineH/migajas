import { describe, expect, it } from "vitest";
import { findForbiddenMarketingPhrases } from "@/lib/domain/brand-positioning";
import {
  CONSULT_VISIT_COPY,
  PROFESSIONAL_AUDIENCES,
  PROFESSIONAL_CAN,
  PROFESSIONAL_CANNOT,
  PROFESSIONAL_CYCLE_STEPS,
  PROFESSIONAL_NOT_DIRECTORY,
  PROFESSIONAL_PAGE,
  PROFESSIONAL_SCRIPT,
  consultVisitBody,
  latestPassedLevelName,
} from "@/lib/domain/professional-cycle";

const LEVELS = [
  { id: "nivel-1", name: "Nivel 1 — Fundamentos" },
  { id: "nivel-2", name: "Nivel 2 — Cereales" },
  { id: "nivel-3", name: "Nivel 3 — Verduras" },
];

function allCopy(): string {
  return [
    PROFESSIONAL_PAGE.headline,
    PROFESSIONAL_PAGE.lead,
    PROFESSIONAL_PAGE.description,
    PROFESSIONAL_PAGE.audienceLead,
    PROFESSIONAL_AUDIENCES.map((item) => `${item.title} ${item.body}`).join(" "),
    PROFESSIONAL_CYCLE_STEPS.map((item) => `${item.title} ${item.body}`).join(" "),
    PROFESSIONAL_CAN.join(" "),
    PROFESSIONAL_CANNOT.join(" "),
    PROFESSIONAL_SCRIPT,
    PROFESSIONAL_NOT_DIRECTORY,
    CONSULT_VISIT_COPY.empty,
    CONSULT_VISIT_COPY.withLevel("Nivel 1"),
    CONSULT_VISIT_COPY.examPassed("Nivel 1"),
  ].join(" ");
}

describe("professional-cycle", () => {
  it("picks the highest passed level in curriculum order", () => {
    expect(
      latestPassedLevelName(
        [
          { levelId: "nivel-1", passed: true },
          { levelId: "nivel-2", passed: true },
        ],
        LEVELS,
      ),
    ).toBe("Nivel 2 — Cereales");
  });

  it("ignores failed completions", () => {
    expect(
      latestPassedLevelName(
        [
          { levelId: "nivel-1", passed: true },
          { levelId: "nivel-2", passed: false },
        ],
        LEVELS,
      ),
    ).toBe("Nivel 1 — Fundamentos");
  });

  it("returns null when nothing is passed", () => {
    expect(latestPassedLevelName([], LEVELS)).toBeNull();
    expect(consultVisitBody(null)).toBe(CONSULT_VISIT_COPY.empty);
  });

  it("names the level in the consult talking point", () => {
    expect(consultVisitBody("Nivel 1 — Fundamentos")).toContain(
      "voy por el Nivel 1 — Fundamentos",
    );
  });

  it("names the clinical and public audiences", () => {
    expect(PROFESSIONAL_AUDIENCES.map((item) => item.title)).toEqual([
      "Endocrinología",
      "Nutrición clínica",
      "Medicina de familia o de cabecera",
      "Enfermería y educación diabetológica",
      "Entidades públicas de salud",
    ]);
  });

  it("keeps cycle steps as complete sentences with parallel subjects", () => {
    for (const step of PROFESSIONAL_CYCLE_STEPS) {
      expect(step.body.endsWith(".")).toBe(true);
      expect(step.body).not.toMatch(/:$/);
    }
    expect(PROFESSIONAL_CYCLE_STEPS[0]?.body).toMatch(/^Indicas /);
    expect(PROFESSIONAL_CYCLE_STEPS[1]?.body).toMatch(/^La persona /);
    expect(PROFESSIONAL_CYCLE_STEPS[2]?.body).toMatch(/^Preguntas /);
    expect(PROFESSIONAL_CYCLE_STEPS[3]?.body).toMatch(/^Quien coordina /);
  });

  it("contrasts professional infinitives with Migajas in third person", () => {
    for (const item of PROFESSIONAL_CAN) {
      expect(item.charAt(0)).toMatch(/[A-ZÁÉÍÓÚÑ«]/);
    }
    for (const item of PROFESSIONAL_CANNOT) {
      expect(item.startsWith("No ")).toBe(true);
      expect(item.endsWith(".")).toBe(true);
    }
  });

  it("avoids marketplace wording and forbidden marketing claims", () => {
    const blob = allCopy();
    expect(findForbiddenMarketingPhrases(blob)).toEqual([]);
    expect(blob).not.toMatch(/marketplace/i);
    expect(PROFESSIONAL_NOT_DIRECTORY).toMatch(/no publica un directorio/i);
    expect(PROFESSIONAL_CANNOT.join(" ")).toMatch(
      /diario de conteo de carbohidratos/i,
    );
    expect(PROFESSIONAL_SCRIPT).toMatch(/comida local/);
    expect(PROFESSIONAL_SCRIPT).not.toMatch(/comida de aquí/);
  });
});
