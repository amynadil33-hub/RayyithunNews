import { supabase } from "../lib/supabaseClient.ts";
import type { Category } from "../lib/database.types.ts";

export async function getCategories(portalSlug?: string) {
  let query = supabase
    .from("categories")
    .select("*, portal:portals!inner(*)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (portalSlug) {
    // Filter via portal join
    query = query.eq("portal.slug", portalSlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(portalSlug: string, categorySlug?: string) {
  const slug = categorySlug ?? portalSlug;
  let query = supabase
    .from("categories")
    .select("*, portal:portals!inner(*)")
    .eq("slug", slug)
    .eq("is_active", true);
  if (categorySlug) query = query.eq("portal.slug", portalSlug);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as Category | null;
}

export async function createCategory(category: Partial<Category>) {
  const { data, error } = await supabase
    .from("categories")
    .insert(category as never)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  const { data, error } = await supabase
    .from("categories")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function adminGetCategories(portalId?: string) {
  let query = supabase.from("categories").select("*, portal:portals!inner(*)").order("sort_order");
  if (portalId) query = query.eq("portal_id", portalId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Category[];
}
export const adminCreateCategory = createCategory;
export const adminUpdateCategory = updateCategory;
export const adminDeleteCategory = deleteCategory;
