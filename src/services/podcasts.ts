import { supabase } from "../lib/supabaseClient.ts";
import type { Podcast } from "../lib/database.types.ts";

export async function getPodcasts(portalSlug?: string, limit = 10) {
  let query = supabase
    .from("podcasts")
    .select("*, portal:portals!inner(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (portalSlug) {
    query = query.eq("portal.slug", portalSlug);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Podcast[];
}

export async function getPodcastBySlug(slug: string) {
  const { data, error } = await supabase
    .from("podcasts")
    .select("*, portal:portals(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error) throw error;
  return data as Podcast | null;
}

export async function getAllPodcasts() {
  const { data, error } = await supabase
    .from("podcasts")
    .select("*, portal:portals(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Podcast[];
}

export async function createPodcast(podcast: Partial<Podcast>) {
  const { data, error } = await supabase
    .from("podcasts")
    .insert(podcast as never)
    .select()
    .single();
  if (error) throw error;
  return data as Podcast;
}

export async function updatePodcast(id: string, updates: Partial<Podcast>) {
  const { data, error } = await supabase
    .from("podcasts")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Podcast;
}

export async function deletePodcast(id: string) {
  const { error } = await supabase.from("podcasts").delete().eq("id", id);
  if (error) throw error;
}

export const getPublishedPodcasts = (portalSlug: string) => getPodcasts(portalSlug);
export async function adminGetPodcasts(portalId?: string) {
  let query = supabase.from("podcasts").select("*, portal:portals!inner(*)").order("created_at", { ascending: false });
  if (portalId) query = query.eq("portal_id", portalId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Podcast[];
}
export const adminCreatePodcast = createPodcast;
export const adminUpdatePodcast = updatePodcast;
export const adminDeletePodcast = deletePodcast;
