import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getArticles,
  getArticlesByCategory,
  type ArticleFilters,
} from "../services/articles.ts";
import { getCategories } from "../services/categories.ts";
import { getActiveAds } from "../services/advertisements.ts";
import { getPodcasts } from "../services/podcasts.ts";
import type { AdPlacement } from "../lib/database.types.ts";
import { subscribeToNewsletter } from "../services/contact.ts";

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () => getArticles(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useArticlesByCategory(
  portalSlug: string,
  categorySlug?: string,
  limit = 12,
  offset = 0,
) {
  return useQuery({
    queryKey: ["articles", "category", portalSlug, categorySlug, limit, offset],
    queryFn: () =>
      getArticlesByCategory(portalSlug, categorySlug!, limit, offset),
    enabled: Boolean(categorySlug),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCategories(portalSlug?: string) {
  return useQuery({
    queryKey: ["categories", portalSlug],
    queryFn: () => getCategories(portalSlug),
    staleTime: 1000 * 60 * 10,
  });
}

export function useActiveAds(placement: AdPlacement, portalSlug: string) {
  return useQuery({
    queryKey: ["ads", portalSlug, placement],
    queryFn: () => getActiveAds(portalSlug, placement),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePodcasts(portalSlug?: string, limit = 6) {
  return useQuery({
    queryKey: ["podcasts", portalSlug, limit],
    queryFn: () => getPodcasts(portalSlug, limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewsletterSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, portalId }: { email: string; portalId?: string }) =>
      subscribeToNewsletter(email, portalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["newsletter"] });
    },
  });
}
