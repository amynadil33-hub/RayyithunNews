import { supabase } from "../lib/supabaseClient.ts";
import type { SiteSetting, StaticPage, Portal, Profile } from "../lib/database.types.ts";

// Site Settings
export async function getSiteSetting(key: string, portalId?: string) {
  let query = supabase
    .from("site_settings")
    .select("*")
    .eq("key", key);
  if (portalId) {
    query = query.eq("portal_id", portalId);
  }
  const { data, error } = await query.single();
  if (error) return null;
  return data as SiteSetting;
}

export async function upsertSiteSetting(key: string, value: unknown, portalId?: string) {
  const { error } = await supabase.from("site_settings").upsert(
    {
      key,
      value,
      portal_id: portalId ?? null,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "portal_id,key" }
  );
  if (error) throw error;
}

// Static Pages
export async function getStaticPages(portalId?: string) {
  let query = supabase
    .from("static_pages")
    .select("*")
    .eq("status", "published")
    .order("title");
  if (portalId) {
    query = query.eq("portal_id", portalId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StaticPage[];
}

export async function getStaticPageBySlug(slug: string) {
  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as StaticPage | null;
}

export async function upsertStaticPage(page: Partial<StaticPage>) {
  const { data, error } = await supabase
    .from("static_pages")
    .upsert({ ...page, updated_at: new Date().toISOString() } as never)
    .select()
    .single();
  if (error) throw error;
  return data as StaticPage;
}

// Portals
export async function getPortals() {
  const { data, error } = await supabase
    .from("portals")
    .select("*")
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []) as Portal[];
}

export async function getPortalBySlug(slug: string) {
  const { data, error } = await supabase
    .from("portals")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Portal;
}

// Admin Users
export async function getAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function updateUserRole(id: string, role: Profile["role"]) {
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}
