import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "./sanitizeHtml.ts";

describe("sanitizeArticleHtml", () => {
  it("preserves supported rich article formatting", () => {
    const result = sanitizeArticleHtml(
      "<h2>Heading</h2><p>First <strong>bold</strong> paragraph.</p><blockquote>Quote</blockquote><ul><li>Item</li></ul>",
    );

    expect(result).toContain("<h2>Heading</h2>");
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<blockquote>Quote</blockquote>");
    expect(result).toContain("<li>Item</li>");
  });

  it("converts legacy plain text into separate paragraphs", () => {
    expect(sanitizeArticleHtml("First paragraph.\n\nSecond paragraph.")).toBe(
      "<p>First paragraph.</p><p>Second paragraph.</p>",
    );
  });

  it("removes unsafe tags and link protocols", () => {
    const result = sanitizeArticleHtml(
      '<p>Safe</p><script>alert(1)</script><a href="javascript:alert(1)">Bad link</a>',
    );

    expect(result).toBe("<p>Safe</p><a>Bad link</a>");
  });
});
