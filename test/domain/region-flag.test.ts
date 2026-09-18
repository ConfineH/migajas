import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RegionFlag } from "@/components/brand/RegionFlag";

describe("RegionFlag", () => {
  it("renders vector flags instead of emoji ISO letters", () => {
    const es = renderToStaticMarkup(createElement(RegionFlag, { regionId: "es" }));
    const dominican = renderToStaticMarkup(
      createElement(RegionFlag, { regionId: "do" }),
    );

    expect(es).toContain("<svg");
    expect(es).toContain("#C60B1E");
    expect(es).not.toContain("🇪🇸");
    expect(dominican).toContain("#002D62");
    expect(dominican).toContain("#CE1126");
    expect(dominican).not.toContain("🇩🇴");
  });
});
