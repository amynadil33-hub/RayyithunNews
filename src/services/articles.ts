import { supabase } from "../lib/supabaseClient.ts";
import type {
  Article,
  ArticleReviewAction,
  ArticleStatus,
  PortalSlug,
} from "../lib/database.types.ts";

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

// The workflow adds reviewed_by and published_by foreign keys to profiles.
// Pin this embed to author_id so PostgREST does not reject the query as an
// ambiguous profiles relationship. This remains a left embed, so legacy
// articles with author_id = null are still returned to reviewer roles.
const ARTICLE_SELECT = `*, portal:portals!inner(*), category:categories(*), author:profiles!articles_author_id_fkey(id, full_name, avatar_url)`;
const REVIEW_QUEUE_STATUSES: ArticleStatus[] = ["submitted", "in_review", "changes_requested", "approved"];

function stripArticleRelations(article: Partial<Article>) {
  const {
    id: _id,
    portal: _portal,
    category: _category,
    author: _author,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...values
  } = article;
  const cleanValues: Partial<Article> = { ...values };
  if (!cleanValues.additional_image_1_url) delete cleanValues.additional_image_1_url;
  if (!cleanValues.additional_image_2_url) delete cleanValues.additional_image_2_url;
  return cleanValues;
}

export async function supportsArticleGalleryImages() {
  const { error } = await supabase
    .from("articles")
    .select("additional_image_1_url, additional_image_2_url")
    .limit(1);

  if (!error) return true;
  const missingColumn = /additional_image_[12]_url|schema cache|does not exist/i.test(error.message);
  if (missingColumn) return false;
  throw error;
}

async function requireCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("You must be signed in to manage articles.");
  return data.user.id;
}

async function updateWorkflowState(id: string, values: Partial<Article>) {
  const { data, error } = await supabase
    .from("articles")
    .update({ ...values, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Article;
}

async function logReview(articleId: string, reviewerId: string, action: ArticleReviewAction, notes?: string) {
  const { error } = await supabase.from("article_reviews").insert({
    article_id: articleId,
    reviewer_id: reviewerId,
    action,
    notes: notes?.trim() || null,
  } as never);
  // Review history is supplementary. A missing history table or a narrower
  // history policy must not roll back an article state change that succeeded.
  if (error) console.warn("Article review history could not be recorded:", error.message);
}

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
  const values = stripArticleRelations(article);
  const { data, error } = await supabase.from("articles").insert(values as never).select().single();
  if (error) throw error;
  return data as Article;
}

export async function adminUpdateArticle(id: string, article: Partial<Article>) {
  const values = stripArticleRelations(article);
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

export async function createDraftArticle(data: Partial<Article>) {
  const userId = await requireCurrentUserId();
  return adminCreateArticle({
    ...stripArticleRelations(data),
    author_id: userId,
    status: "draft",
    submitted_at: null,
    reviewed_by: null,
    reviewed_at: null,
    published_by: null,
  });
}

export async function submitArticle(id: string, data: Partial<Article>) {
  const userId = await requireCurrentUserId();
  const {
    status: _status,
    submitted_at: _submittedAt,
    reviewed_by: _reviewedBy,
    reviewed_at: _reviewedAt,
    published_by: _publishedBy,
    published_at: _publishedAt,
    scheduled_at: _scheduledAt,
    ...editableValues
  } = stripArticleRelations(data);
  return updateWorkflowState(id, {
    ...editableValues,
    author_id: editableValues.author_id ?? userId,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    scheduled_at: null,
  });
}

export async function markArticleInReview(id: string) {
  const reviewerId = await requireCurrentUserId();
  const article = await updateWorkflowState(id, { status: "in_review" });
  await logReview(id, reviewerId, "in_review");
  return article;
}

export async function requestArticleChanges(id: string, notes: string) {
  const reviewerId = await requireCurrentUserId();
  const article = await updateWorkflowState(id, {
    status: "changes_requested",
    approval_notes: notes.trim() || null,
  });
  await logReview(id, reviewerId, "changes_requested", notes);
  return article;
}

export async function approveArticle(id: string, notes: string) {
  const reviewerId = await requireCurrentUserId();
  const reviewedAt = new Date().toISOString();
  const article = await updateWorkflowState(id, {
    status: "approved",
    reviewed_by: reviewerId,
    reviewed_at: reviewedAt,
    approval_notes: notes.trim() || null,
  });
  await logReview(id, reviewerId, "approved", notes);
  return article;
}

export async function publishArticle(id: string) {
  const reviewerId = await requireCurrentUserId();
  const { data: current, error } = await supabase
    .from("articles")
    .select("published_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  const currentArticle = current as Pick<Article, "published_at">;

  const reviewedAt = new Date().toISOString();
  const article = await updateWorkflowState(id, {
    status: "published",
    published_at: currentArticle.published_at ?? reviewedAt,
    published_by: reviewerId,
    reviewed_by: reviewerId,
    reviewed_at: reviewedAt,
    scheduled_at: null,
  });
  await logReview(id, reviewerId, "published", article.approval_notes ?? undefined);
  return article;
}

export async function scheduleArticle(id: string, scheduledAt: string) {
  await requireCurrentUserId();
  return updateWorkflowState(id, {
    status: "scheduled",
    scheduled_at: scheduledAt,
  });
}

export async function archiveArticle(id: string) {
  const reviewerId = await requireCurrentUserId();
  const article = await updateWorkflowState(id, { status: "archived" });
  await logReview(id, reviewerId, "archived", article.approval_notes ?? undefined);
  return article;
}

export async function getMyArticles(userId: string) {
  if (!userId) throw new Error("A signed-in author is required.");
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function getReviewQueueArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .in("status", REVIEW_QUEUE_STATUSES)
    .order("submitted_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function getAllAdminArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Article[];
}

export async function getArticleCountByStatus() {
  const userId = await requireCurrentUserId();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  if (profileError) throw profileError;

  let query = supabase.from("articles").select("status");
  if ((profile as { role: string }).role === "author") {
    query = query.eq("author_id", userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  const counts: Record<ArticleStatus | "total", number> = {
    total: 0,
    draft: 0,
    submitted: 0,
    in_review: 0,
    changes_requested: 0,
    approved: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
  };
  for (const article of (data ?? []) as { status: ArticleStatus }[]) {
    counts.total++;
    counts[article.status]++;
  }
  return counts;
}
