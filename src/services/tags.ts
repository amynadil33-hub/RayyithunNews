import { supabase } from "../lib/supabaseClient.ts";
import type { Tag } from "../lib/database.types.ts";

export async function getTags(portalId: string) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("portal_id", portalId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export async function createTag(
  data: Pick<Tag, "portal_id" | "name" | "slug">,
) {
  const { data: tag, error } = await supabase
    .from("tags")
    .insert(data as never)
    .select()
    .single();
  if (error) throw error;
  return tag as Tag;
}

export async function updateTag(
  id: string,
  data: Partial<Pick<Tag, "name" | "slug">>,
) {
  const { data: tag, error } = await supabase
    .from("tags")
    .update(data as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return tag as Tag;
}

export async function deleteTag(id: string) {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}

export async function getTagsForArticle(articleId: string) {
  const { data, error } = await supabase
    .from("article_tags")
    .select("tag:tags(*)")
    .eq("article_id", articleId);
  if (error) throw error;
  const rows = (data ?? []) as unknown as { tag: Tag | null }[];
  return rows.flatMap((row) => (row.tag ? [row.tag] : []));
}

export async function setArticleTags(articleId: string, tagIds: string[]) {
  const { error: deleteError } = await supabase
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);
  if (deleteError) throw deleteError;
  if (!tagIds.length) return;
  const { error } = await supabase
    .from("article_tags")
    .insert(
      tagIds.map((tagId) => ({
        article_id: articleId,
        tag_id: tagId,
      })) as never,
    );
  if (error) throw error;
}

export function tagSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0780-\u07bf]+/g, "-")
    .replace(/^-|-$/g, "");
}
