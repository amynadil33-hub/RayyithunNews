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
    maybeSingle: vi.fn(),
  };
  categoryQuery.select.mockReturnValue(categoryQuery);
  categoryQuery.eq.mockReturnValue(categoryQuery);

  const articleQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };
  articleQuery.select.mockReturnValue(articleQuery);
  articleQuery.eq.mockReturnValue(articleQuery);
  articleQuery.order.mockReturnValue(articleQuery);

  return {
    portalQuery,
    categoryQuery,
    articleQuery,
    from: vi.fn((table: string) => {
      if (table === "portals") return portalQuery;
      if (table === "categories") return categoryQuery;
      return articleQuery;
    }),
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
    mocks.articleQuery.select.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.eq.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.order.mockReturnValue(mocks.articleQuery);
  });

  it("constrains published articles to the resolved portal and category IDs", async () => {
    mocks.portalQuery.maybeSingle.mockResolvedValue({
      data: { id: "portal-dhivehi" },
      error: null,
    });
    mocks.categoryQuery.maybeSingle.mockResolvedValue({
      data: { id: "category-religion" },
      error: null,
    });
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("dhivehi", "religion", 12, 0);

    expect(mocks.categoryQuery.eq).toHaveBeenCalledWith(
      "portal_id",
      "portal-dhivehi",
    );
    expect(mocks.categoryQuery.eq).toHaveBeenCalledWith("slug", "religion");
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "portal_id",
      "portal-dhivehi",
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "category_id",
      "category-religion",
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("status", "published");
  });

  it("returns an empty category without falling back to unrelated articles", async () => {
    mocks.portalQuery.maybeSingle.mockResolvedValue({
      data: { id: "portal-english" },
      error: null,
    });
    mocks.categoryQuery.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(
      getArticlesByCategory("english", "missing", 12, 0),
    ).resolves.toEqual([]);
    expect(mocks.from).not.toHaveBeenCalledWith("articles");
  });
});
