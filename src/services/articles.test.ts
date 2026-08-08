import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const portalQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  portalQuery.select.mockReturnValue(portalQuery);
  portalQuery.eq.mockReturnValue(portalQuery);

  const categoryQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
  };
  categoryQuery.select.mockReturnValue(categoryQuery);
  categoryQuery.eq.mockReturnValue(categoryQuery);

  const articleQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  articleQuery.select.mockReturnValue(articleQuery);
  articleQuery.eq.mockReturnValue(articleQuery);
  articleQuery.order.mockReturnValue(articleQuery);

  return {
    articleQuery,
    from: vi.fn(() => articleQuery),
  };
});

vi.mock("../lib/supabaseClient.ts", () => ({
  supabase: { from: mocks.from, auth: { getUser: vi.fn() } },
}));

import { getArticlesByCategory } from "./articles.ts";

describe("getArticlesByCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.portalQuery.select.mockReturnValue(mocks.portalQuery);
    mocks.portalQuery.eq.mockReturnValue(mocks.portalQuery);
    mocks.categoryQuery.select.mockReturnValue(mocks.categoryQuery);
    mocks.categoryQuery.eq.mockReturnValue(mocks.categoryQuery);
    mocks.articleQuery.in.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.select.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.eq.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.order.mockReturnValue(mocks.articleQuery);
  });

  it("uses the same portal and category relationship filters as homepage sections", async () => {
  it("constrains published articles to the resolved portal and category IDs", async () => {
    mocks.portalQuery.maybeSingle.mockResolvedValue({
      data: { id: "portal-dhivehi" },
      error: null,
    });
    mocks.categoryQuery.in.mockResolvedValue({
      data: [{ id: "category-religion" }],
      error: null,
    });
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("english", "news", 12, 0);

    expect(mocks.from).toHaveBeenCalledWith("articles");
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "portal.slug",
      "english",
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("category.slug", "news");
    expect(mocks.categoryQuery.eq).toHaveBeenCalledWith(
      "portal_id",
      "portal-dhivehi",
    );
    expect(mocks.categoryQuery.in).toHaveBeenCalledWith("slug", [
      "religion",
      "dv-religion",
    ]);
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "portal_id",
      "portal-dhivehi",
    );
    expect(mocks.articleQuery.in).toHaveBeenCalledWith("category_id", [
      "category-religion",
    ]);
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.articleQuery.range).toHaveBeenCalledWith(0, 11);
  });

  it("applies the requested category-page offset", async () => {
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("dhivehi", "business", 12, 12);
  it("returns an empty category without falling back to unrelated articles", async () => {
    mocks.portalQuery.maybeSingle.mockResolvedValue({
      data: { id: "portal-english" },
      error: null,
    });
    mocks.categoryQuery.in.mockResolvedValue({
      data: [],
      error: null,
    });

    expect(mocks.articleQuery.range).toHaveBeenCalledWith(12, 23);
  });
});
