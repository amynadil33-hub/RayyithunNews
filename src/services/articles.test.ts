import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
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
    mocks.articleQuery.select.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.eq.mockReturnValue(mocks.articleQuery);
    mocks.articleQuery.order.mockReturnValue(mocks.articleQuery);
  });

  it("uses the same portal and category relationship filters as homepage sections", async () => {
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("english", "news", 12, 0);

    expect(mocks.from).toHaveBeenCalledWith("articles");
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith(
      "portal.slug",
      "english",
    );
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("category.slug", "news");
    expect(mocks.articleQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(mocks.articleQuery.range).toHaveBeenCalledWith(0, 11);
  });

  it("applies the requested category-page offset", async () => {
    mocks.articleQuery.range.mockResolvedValue({ data: [], error: null });

    await getArticlesByCategory("dhivehi", "business", 12, 12);

    expect(mocks.articleQuery.range).toHaveBeenCalledWith(12, 23);
  });
});
