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
    in: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
  };

  articleQuery.select.mockReturnValue(articleQuery);
  articleQuery.eq.mockReturnValue(articleQuery);
  articleQuery.in.mockReturnValue(articleQuery);
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

import { getArticles, getArticlesByCategory } from "./articles.ts";

describe("getArticlesByCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.articleQuery.select.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.eq.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.in.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.order.mockReturnValue(mocks.articleQuery);
    mocks.portalQuery.select.mockReturnValue(mocks.portalQuery);
    mocks.portalQuery.eq.mockReturnValue(mocks.portalQuery);
    mocks.portalQuery.maybeSingle.mockResolvedValue({
      data: { id: "portal-id" },
      error: null,
    });
    mocks.categoryQuery.select.mockReturnValue(mocks.categoryQuery);
    mocks.categoryQuery.eq.mockReturnValue(mocks.categoryQuery);
    mocks.categoryQuery.maybeSingle.mockResolvedValue({
      data: { id: "category-id" },
      error: null,
    });
  });

  it("constrains published articles to portal and category slug filters", async () => {
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("english", "news", 12, 0);

    expect(mocks.from).toHaveBeenCalledWith("articles");
    expect(mocks.portalQuery.eq).toHaveBeenCalledWith("slug", "english");
    expect(mocks.categoryQuery.eq).toHaveBeenCalledWith("slug", "news");
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "category_id",
      "category-id",
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.articleQuery.range).toHaveBeenCalledWith(0, 11);
  });

  it("applies the requested category-page offset", async () => {
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("dhivehi", "business", 12, 12);

    expect(mocks.portalQuery.eq).toHaveBeenCalledWith("slug", "dhivehi");
    expect(mocks.categoryQuery.eq).toHaveBeenCalledWith("slug", "business");
    expect(mocks.articleQuery.range).toHaveBeenCalledWith(12, 23);
  });
});

describe("getArticles category filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.articleQuery.select.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.eq.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.order.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });
  });

  it("uses an inner category join so unrelated articles are excluded", async () => {
    await getArticles({
      portalSlug: "english",
      categorySlug: "news",
      limit: 4,
    });

    expect(mocks.articleQuery.select).toHaveBeenCalledWith(
      expect.stringContaining("category:categories!inner(*)"),
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("category.slug", "news");
    expect(mocks.articleQuery.range).toHaveBeenCalledWith(0, 3);
  });
});
