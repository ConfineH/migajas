import { describe, it, expect } from "vitest";
import {
  applyPlainLanguageDo,
  buildPlainReferenceTipsDo,
} from "@/lib/domain/plain-language-do";

describe("applyPlainLanguageDo", () => {
  it("replaces nutrition jargon with everyday words", () => {
    const input =
      "Arroz, viandas y plátano. Los moduladores y 15 g de HC en un plato mixto con legumbres.";
    const plain = applyPlainLanguageDo(input);

    expect(plain).not.toContain("viandas");
    expect(plain).not.toContain("modulador");
    expect(plain).not.toContain(" HC");
    expect(plain).toContain("yuca, plátano y batata");
    expect(plain).toContain("habichuelas");
    expect(plain).toContain("plato con varias cosas");
    expect(plain).toContain("15 g de carbohidratos");
  });
});

describe("buildPlainReferenceTipsDo", () => {
  it("uses plain tips without HC abbreviation", () => {
    const tips = buildPlainReferenceTipsDo(15);
    expect(tips.join(" ")).not.toMatch(/\bHC\b/);
    expect(tips.some((tip) => tip.includes("pollo"))).toBe(true);
  });
});
