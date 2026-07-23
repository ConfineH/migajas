import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

const COMMERCIAL_ROOT = path.join(process.cwd(), "docs", "commercial");

/** Paths required by openspec/specs/commercial-packaging/spec.md */
const REQUIRED_COMMERCIAL_DOCS = [
  "README-BUYER.md",
  "DEPLOYMENT.md",
  "SCHEMA.md",
  "ADMIN-GUIDE.md",
  "LEGAL/README.md",
  "LEGAL/DPA-TEMPLATE.md",
  "LEGAL/PRIVACY-POLICY-TEMPLATE.md",
  "LEGAL/COOKIE-NOTICE-TEMPLATE.md",
  "LEGAL/HEALTH-DATA-DISCLAIMER.md",
  "LEGAL/MDR-POSITION.md",
  "LEGAL/ROPA-TEMPLATE.md",
  "LEGAL/BREACH-PROCEDURE.md",
] as const;

describe("commercial documentation kit manifest", () => {
  it("includes every file listed in commercial-packaging spec", () => {
    const missing = REQUIRED_COMMERCIAL_DOCS.filter(
      (relativePath) => !existsSync(path.join(COMMERCIAL_ROOT, relativePath)),
    );

    expect(missing, `Missing docs: ${missing.join(", ")}`).toEqual([]);
  });
});
