import { describe, expect, it } from "vitest";
import { tagSlug } from "./tags.ts";

describe("tagSlug", () => {
  it("creates stable English tag slugs", () => {
    expect(tagSlug("  Climate Change  ")).toBe("climate-change");
  });

  it("preserves Thaana characters", () => {
    expect(tagSlug("މޫސުމާ ބެހޭ")).toBe("މޫސުމާ-ބެހޭ");
  });
});
