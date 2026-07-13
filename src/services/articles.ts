import { supabase } from "../lib/supabaseClient.ts";
import type { Article, ArticleStatus, PortalSlug } from "../lib/database.types.ts";

export interface ArticleFilters {
  portalSlug?: PortalSlug | string;
  categorySlug?: string;
  status?: ArticleStatus;
  includeAllStatuses?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBreaking?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

const ARTICLE_SELECT = `*, portal:portals!inner(*), category:categories(*), author:profiles(id, full_name, avatar_url)`;

export async function getArticles(filters: ArticleFilters = {}) {
  let query = supabase.from("articles").select(ARTICLE_SELECT).order("published_at", { ascending: false, nullsFirst: false });
  if (filters.portalSlug) query = query.eq("portal.slug", filters.portalSlug);
  if (filters.categorySlug) query = query.eq("category.slug", filters.categorySlug);
  if (filters.status) query = query.eq("status", filters.status);
  else if (!filters.includeAllStatuses) query = query.eq("status", "published");
  if (filters.isFeatured !== undefined) query = query.eq("is_featured", filters.isFeatured);
  if (filters.isTrending !== undefined) query = query.eq("is_trending", filters.isTrending);
  if (filters.isBreaking !== undefined) query = query.eq("is_breaking", filters.isBreaking);
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[,%()]/g, " ");
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }
  if (filters.limit) {
    const from = filters.offset ?? 0;
    query = query.range(from, from + filters.limit - 1);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export const getPublishedArticles = (portalSlug: string) => getArticles({ portalSlug });
export const getFeaturedArticles = (portalSlug: string) => getArticles({ portalSlug, isFeatured: true });
export const getTrendingArticles = (portalSlug: string) => getArticles({ portalSlug, isTrending: true });
export const getLatestArticles = (portalSlug: string, limit = 10) => getArticles({ portalSlug, limit });
export const getArticlesByCategory = (portalSlug: string, categorySlug: string) => getArticles({ portalSlug, categorySlug });
export const searchArticles = (portalSlug: string, search: string) => getArticles({ portalSlug, search });

export async function getArticleBySlug(portalSlug: string, slug?: string) {
  const actualSlug = slug ?? portalSlug;
  let query = supabase.from("articles").select(ARTICLE_SELECT).eq("slug", actualSlug).eq("status", "published");
  if (slug) query = query.eq("portal.slug", portalSlug);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as unknown as Article | null;
}

export async function getRelatedArticles(articleId: string, categoryId: string, portalId: string, limit = 4) {
  const { data, error } = await supabase.from("articles").select(ARTICLE_SELECT).eq("portal_id", portalId).eq("category_id", categoryId).eq("status", "published").neq("id", articleId).order("published_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function adminGetArticles(portalId?: string) {
  let query = supabase.from("articles").select(ARTICLE_SELECT).order("created_at", { ascending: false });
  if (portalId) query = query.eq("portal_id", portalId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function adminGetArticle(id: string) {
  const { data, error } = await supabase.from("articles").select(ARTICLE_SELECT).eq("id", id).single();
  if (error) throw error;
  return data as unknown as Article;
}

export async function adminCreateArticle(article: Partial<Article>) {
  const { portal, category, author, ...values } = article;
  const { data, error } = await supabase.from("articles").insert(values as never).select().single();
  if (error) throw error;
  return data as Article;
}

export async function adminUpdateArticle(id: string, article: Partial<Article>) {
  const { portal, category, author, ...values } = article;
  const { data, error } = await supabase.from("articles").update({ ...values, updated_at: new Date().toISOString() } as never).eq("id", id).select().single();
  if (error) throw error;
  return data as Article;
}

export async function adminDeleteArticle(id: string) {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}

export const createArticle = adminCreateArticle;
export const updateArticle = adminUpdateArticle;
export const deleteArticle = adminDeleteArticle;

export async function getArticleCountByStatus() {
  const { data, error } = await supabase.from("articles").select("status");
  if (error) throw error;
  const counts = { total: 0, published: 0, draft: 0, scheduled: 0, archived: 0 };
  for (const article of (data ?? []) as { status: ArticleStatus }[]) { counts.total++; counts[article.status]++; }
  return counts;
}
