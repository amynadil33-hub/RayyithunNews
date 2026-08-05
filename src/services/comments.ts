import { supabase } from "../lib/supabaseClient.ts";
import type { Comment, CommentStatus } from "../lib/database.types.ts";

export async function submitComment(
  articleId: string,
  data: Pick<Comment, "name" | "email" | "comment">,
) {
  const { error } = await supabase.from("comments").insert({
    article_id: articleId,
    ...data,
    status: "pending",
    approved_by: null,
    approved_at: null,
  } as never);
  if (error) throw error;
}

export async function getApprovedComments(articleId: string) {
  const { data, error } = await supabase
    .from("public_comments")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

export async function adminGetComments(status?: CommentStatus) {
  let query = supabase
    .from("comments")
    .select("*, article:articles(id, title, slug)")
    .order("status")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  const comments = (data ?? []) as unknown as Comment[];
  const statusOrder: Record<CommentStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
    spam: 3,
  };
  return comments.sort(
    (left, right) => statusOrder[left.status] - statusOrder[right.status],
  );
}

async function moderateComment(id: string, status: CommentStatus) {
  const { data: auth } = await supabase.auth.getUser();
  const approved = status === "approved";
  const { data, error } = await supabase
    .from("comments")
    .update({
      status,
      approved_by: approved ? (auth.user?.id ?? null) : null,
      approved_at: approved ? new Date().toISOString() : null,
    } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Comment;
}

export const approveComment = (id: string) => moderateComment(id, "approved");
export const rejectComment = (id: string) => moderateComment(id, "rejected");
export const markCommentSpam = (id: string) => moderateComment(id, "spam");

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}
