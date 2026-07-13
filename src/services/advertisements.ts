import { supabase } from "../lib/supabaseClient.ts";
import type { Advertisement, AdPlacement } from "../lib/database.types.ts";

export async function getActiveAds(portalSlug: string, placement: AdPlacement) {
  const today = new Date().toISOString().split("T")[0];

  let query = supabase
    .from("advertisements")
    .select("*")
    .eq("is_active", true)
    .eq("placement", placement)
    .order("priority", { ascending: false })
    .limit(3);
  query = query.or(`start_date.is.null,start_date.lte.${today}`).or(`end_date.is.null,end_date.gte.${today}`);
  const { data: portal, error: portalError } = await supabase.from("portals").select("id").eq("slug", portalSlug).single();
  if (portalError) throw portalError;
  query = query.or(`portal_id.eq.${(portal as { id: string }).id},portal_id.is.null`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Advertisement[];
}

export async function getActiveAd(portalSlug: string, placement: AdPlacement) {
  return (await getActiveAds(portalSlug, placement))[0] ?? null;
}

export async function getAllAds() {
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Advertisement[];
}

export async function createAd(ad: Partial<Advertisement>) {
  const { data, error } = await supabase
    .from("advertisements")
    .insert(ad as never)
    .select()
    .single();
  if (error) throw error;
  return data as Advertisement;
}

export async function updateAd(id: string, updates: Partial<Advertisement>) {
  const { data, error } = await supabase
    .from("advertisements")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Advertisement;
}

export async function deleteAd(id: string) {
  const { error } = await supabase.from("advertisements").delete().eq("id", id);
  if (error) throw error;
}

export async function trackAdImpression(id: string) {
  const { error } = await supabase.rpc("increment_ad_impressions", { ad_id: id } as never);
  if (error) throw error;
}

export async function trackAdClick(id: string) {
  const { error } = await supabase.rpc("increment_ad_clicks", { ad_id: id } as never);
  if (error) throw error;
}

export const adminGetAds = getAllAds;
export const adminCreateAd = createAd;
export const adminUpdateAd = updateAd;
export const adminDeleteAd = deleteAd;
export const incrementAdImpression = trackAdImpression;
export const incrementAdClick = trackAdClick;
