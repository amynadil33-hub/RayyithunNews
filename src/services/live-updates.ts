import { supabase } from "../lib/supabaseClient.ts";
import type { ArticleLiveUpdate } from "../lib/database.types.ts";

export async function getLiveUpdates(articleId: string) {
  const { data, error } = await supabase
    .from("article_live_updates")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ArticleLiveUpdate[];
}

export async function adminAddLiveUpdate(
  articleId: string,
  data: Pick<ArticleLiveUpdate, "update_title" | "update_body">,
) {
  const { data: update, error } = await supabase
    .from("article_live_updates")
    .insert({ article_id: articleId, ...data } as never)
    .select()
    .single();
  if (error) throw error;
  return update as ArticleLiveUpdate;
}

export async function adminUpdateLiveUpdate(
  id: string,
  data: Partial<Pick<ArticleLiveUpdate, "update_title" | "update_body">>,
) {
  const { data: update, error } = await supabase
    .from("article_live_updates")
    .update(data as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return update as ArticleLiveUpdate;
}

export async function adminDeleteLiveUpdate(id: string) {
  const { error } = await supabase
    .from("article_live_updates")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
