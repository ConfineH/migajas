import { describe, it, expect } from "vitest";
import {
  EDUCATIONAL_DISCLAIMER,
  getSourceById,
  getSourcesForRegion,
  groupSourcesByScope,
  inferFoodSourceId,
  resolveStepSourceIds,
  SOURCE_SCOPES,
} from "@/lib/domain/content-sources";

describe("content-sources", () => {
  it("exposes educational disclaimer", () => {
    expect(EDUCATIONAL_DISCLAIMER).toMatch(/educativo/i);
    expect(EDUCATIONAL_DISCLAIMER).toMatch(/médico/i);
  });

  it("returns Spain sources only for es region", () => {
    const sources = getSourcesForRegion("es");
    expect(sources.length).toBeGreaterThanOrEqual(5);
    expect(sources.every((s) => !s.regionIds || s.regionIds.includes("es"))).toBe(
      true,
    );
  });

  it("includes BEDCA, FEN, ADA, and Migajas methodology", () => {
    const ids = getSourcesForRegion("es").map((s) => s.id);
    expect(ids).toContain("bedca");
    expect(ids).toContain("fen");
    expect(ids).toContain("ada");
    expect(ids).toContain("migajas-exchange-unit");
  });

  it("groups sources by scope labels", () => {
    const grouped = groupSourcesByScope(getSourcesForRegion("es"));
    expect(Object.keys(grouped)).toEqual(
      expect.arrayContaining([
        SOURCE_SCOPES["nutrition-data"],
        SOURCE_SCOPES["clinical-guideline"],
        SOURCE_SCOPES.methodology,
      ]),
    );
    expect(grouped[SOURCE_SCOPES["nutrition-data"]].length).toBeGreaterThan(0);
  });

  it("resolves source by id", () => {
    const bedca = getSourceById("bedca");
    expect(bedca?.url).toMatch(/bedca/i);
    expect(getSourceById("missing")).toBeUndefined();
  });

  it("infers BEDCA source from food notes", () => {
    expect(inferFoodSourceId({ notes: "BEDCA" })).toBe("bedca");
    expect(inferFoodSourceId({ notes: "8 g fibra/100 g (BEDCA)" })).toBe(
      "bedca",
    );
    expect(inferFoodSourceId({ notes: "Base" })).toBeNull();
    expect(inferFoodSourceId({ sourceId: "bedca", notes: "Base" })).toBe(
      "bedca",
    );
  });

  it("resolves explicit lesson step sources", () => {
    expect(
      resolveStepSourceIds({
        sourceIds: ["fen", "ada"],
        body: "Sin menciones",
      }),
    ).toEqual(["fen", "ada"]);
  });

  it("infers FEN and ADA from lesson step copy when sourceIds missing", () => {
    expect(
      resolveStepSourceIds({
        title: "Consejos",
        body: "La FEN y ADA recomiendan legumbres.",
      }),
    ).toEqual(["fen", "ada"]);
  });
});
