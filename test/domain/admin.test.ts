import { describe, it, expect } from "vitest";
import { isContentAdmin, parseAdminEmails } from "@/lib/domain/admin";

describe("admin", () => {
  it("parses comma-separated admin emails", () => {
    expect(parseAdminEmails("a@x.com, B@Y.com")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("checks admin membership case-insensitively", () => {
    expect(isContentAdmin("Admin@X.com", ["admin@x.com"])).toBe(true);
    expect(isContentAdmin("other@x.com", ["admin@x.com"])).toBe(false);
  });
});
