import { supabase } from "../lib/supabaseClient.ts";
import type { StaticPage } from "../lib/database.types.ts";

export async function getStaticPage(portalSlug: string, slug: string) {
  const { data, error } = await supabase.from("static_pages").select("*, portal:portals!inner(*)").eq("portal.slug", portalSlug).eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data as StaticPage | null;
}
export async function adminGetPages(portalId?: string) {
  let query = supabase.from("static_pages").select("*").order("updated_at", { ascending: false });
  if (portalId) query = query.eq("portal_id", portalId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StaticPage[];
}
export async function adminCreatePage(page: Partial<StaticPage>) {
  const { data, error } = await supabase.from("static_pages").insert(page as never).select().single();
  if (error) throw error;
  return data as StaticPage;
}
export async function adminUpdatePage(id: string, page: Partial<StaticPage>) {
  const { data, error } = await supabase.from("static_pages").update({ ...page, updated_at: new Date().toISOString() } as never).eq("id", id).select().single();
  if (error) throw error;
  return data as StaticPage;
}
export async function adminDeletePage(id: string) {
  const { error } = await supabase.from("static_pages").delete().eq("id", id);
  if (error) throw error;
}
