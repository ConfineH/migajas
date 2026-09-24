import { describe, expect, it } from "vitest";
import { buildAppNavLinks } from "@/lib/domain/app-nav";

describe("buildAppNavLinks", () => {
  it("offers a single start path before the course begins", () => {
    const links = buildAppNavLinks({
      isLoggedIn: false,
      courseStarted: false,
    });
    expect(links.primary.map((link) => link.label)).toEqual(["Empezar"]);
    expect(links.more.map((link) => link.label)).not.toContain("Configuración");
    expect(links.primary.map((link) => link.href)).not.toContain("/learn");
    expect(links.primary.map((link) => link.href)).not.toContain("/progress");
  });

  it("shows the course and settings after it has started", () => {
    const links = buildAppNavLinks({
      isLoggedIn: true,
      courseStarted: true,
      showGuide: true,
    });
    expect(links.primary.map((link) => link.label)).toEqual([
      "Inicio",
      "Curso",
      "Progreso",
    ]);
    expect(links.more.map((link) => link.label)).toContain("Configuración");
    expect(links.more.map((link) => link.label)).toContain("Guía");
  });
});
