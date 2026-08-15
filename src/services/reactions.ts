import { supabase } from "../lib/supabaseClient.ts";
import type {
  ArticleReaction,
  ArticleReactionName,
} from "../lib/database.types.ts";

export async function getArticleReactions(articleId: string) {
  const { data, error } = await supabase
    .from("article_reactions")
    .select("article_id, reader_key, reaction, created_at, updated_at")
    .eq("article_id", articleId);
  if (error) throw error;
  return (data ?? []) as ArticleReaction[];
}

export async function setArticleReaction(
  articleId: string,
  readerKey: string,
  reaction: ArticleReactionName,
) {
  const { data, error } = await supabase
    .from("article_reactions")
    .upsert(
      {
        article_id: articleId,
        reader_key: readerKey,
        reaction,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "article_id,reader_key" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as ArticleReaction;
}
