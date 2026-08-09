import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";
import type { Article } from "../../lib/database.types.ts";
import { getTagsForArticle } from "../../services/tags.ts";
import { getLiveUpdates } from "../../services/live-updates.ts";
import { getApprovedComments, submitComment } from "../../services/comments.ts";
import { getPublicAuthorName } from "../../lib/author-display.ts";

export function ArticleAuthorMeta({
  article,
  publishDate,
  isDhivehi = false,
}: {
  article: Article;
  publishDate: string;
  isDhivehi?: boolean;
}) {
  const authorName = getPublicAuthorName(article.author);
  const initials = authorName
    ?.split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`mb-8 flex flex-wrap items-center gap-3 border-b border-[#E5E7E2] pb-5 text-sm text-[#6B756E] ${isDhivehi ? "font-thaana flex-row-reverse" : ""}`}
    >
      {article.show_author && authorName && (
        <div className="flex items-center gap-2">
          {article.author?.avatar_url ? (
            <img
              src={article.author.avatar_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D8E8D8] text-xs font-bold text-[#103820]">
              {initials || <UserIcon size={15} />}
            </span>
          )}
          <span className="font-medium text-[#142820]">{authorName}</span>
        </div>
      )}
      {publishDate && (
        <span className="flex items-center gap-1">
          <CalendarIcon size={14} />
          {publishDate}
        </span>
      )}
      {article.read_time && (
        <span className="flex items-center gap-1">
          <ClockIcon size={14} />
          {article.read_time} {isDhivehi ? "މިނިޓު" : "min read"}
        </span>
      )}
    </div>
  );
}

export function ArticleTags({
  articleId,
  isDhivehi = false,
}: {
  articleId: string;
  isDhivehi?: boolean;
}) {
  const { data: tags } = useQuery({
    queryKey: ["article-tags", articleId],
    queryFn: () => getTagsForArticle(articleId),
  });
  if (!tags?.length) return null;
  return (
    <section
      className={`mt-8 flex flex-wrap items-center gap-2 ${isDhivehi ? "font-thaana" : ""}`}
      aria-label="Article tags"
    >
      <span className="text-xs font-semibold text-[#6B756E]">
        {isDhivehi ? "ޓެގްތައް" : "Tags"}
      </span>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="rounded-full bg-[#D8E8D8] px-3 py-1 text-xs font-medium text-[#103820]"
        >
          {tag.name}
        </span>
      ))}
    </section>
  );
}

export function ArticleLiveTimeline({
  articleId,
  isDhivehi = false,
}: {
  articleId: string;
  isDhivehi?: boolean;
}) {
  const { data: updates } = useQuery({
    queryKey: ["live-updates", articleId],
    queryFn: () => getLiveUpdates(articleId),
  });
  if (!updates?.length) return null;
  return (
    <section
      className={`mb-8 rounded-sm border border-red-200 bg-red-50/50 p-5 ${isDhivehi ? "font-thaana text-right" : ""}`}
    >
      <h2 className="mb-4 text-lg font-bold text-red-800">
        {isDhivehi ? "ލައިވް އަޕްޑޭޓްތައް" : "Live Updates"}
      </h2>
      <ol className="space-y-5 border-s-2 border-red-300 ps-5">
        {updates.map((update) => (
          <li key={update.id} className="relative">
            <span className="absolute -start-[1.72rem] top-1 h-2.5 w-2.5 rounded-full bg-red-700" />
            <time className="text-[11px] font-medium text-red-700">
              {new Date(update.created_at).toLocaleString()}
            </time>
            {update.update_title && (
              <h3 className="mt-1 font-bold text-[#142820]">
                {update.update_title}
              </h3>
            )}
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#36463E]">
              {update.update_body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ArticleComments({
  articleId,
  isDhivehi = false,
}: {
  articleId: string;
  isDhivehi?: boolean;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", comment: "" });
  const [submitted, setSubmitted] = useState(false);
  const { data: comments } = useQuery({
    queryKey: ["approved-comments", articleId],
    queryFn: () => getApprovedComments(articleId),
  });
  const mutation = useMutation({
    mutationFn: () => submitComment(articleId, form),
    onSuccess: () => {
      setForm({ name: "", email: "", comment: "" });
      setSubmitted(true);
      void queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
  });
  const inputClass =
    "w-full rounded-sm border border-[#D8DED9] bg-white px-3 py-2.5 text-sm focus:border-[#103820] focus:outline-none";
  return (
    <section
      className={`mt-10 border-t border-[#E5E7E2] pt-8 ${isDhivehi ? "font-thaana text-right" : ""}`}
    >
      <h2 className="mb-5 text-xl font-bold text-[#142820]">
        {isDhivehi ? "ޚިޔާލުތައް" : "Comments"}
      </h2>
      {comments?.length ? (
        <div className="mb-8 space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-sm bg-[#F0F4F0] p-4">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">{comment.name}</strong>
                <time className="text-[11px] text-[#6B756E]">
                  {new Date(comment.created_at).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {comment.comment}
              </p>
            </article>
          ))}
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(false);
          mutation.mutate();
        }}
        className="space-y-3 rounded-sm border border-[#E5E7E2] bg-[#F8FAF8] p-5"
      >
        <h3 className="font-semibold">
          {isDhivehi ? "ޚިޔާލެއް ހުށަހަޅާ" : "Leave a comment"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            maxLength={100}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={isDhivehi ? "ނަން" : "Name"}
            className={inputClass}
          />
          <input
            required
            type="email"
            maxLength={254}
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder={isDhivehi ? "އީމެއިލް" : "Email"}
            className={inputClass}
          />
        </div>
        <textarea
          required
          maxLength={3000}
          rows={4}
          value={form.comment}
          onChange={(event) =>
            setForm({ ...form, comment: event.target.value })
          }
          placeholder={isDhivehi ? "ޚިޔާލު" : "Comment"}
          className={inputClass}
        />
        <button
          disabled={mutation.isPending}
          className="bg-[#103820] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {mutation.isPending
            ? "…"
            : isDhivehi
              ? "ހުށަހަޅާ"
              : "Submit for review"}
        </button>
        {submitted && (
          <p className="text-sm text-green-800">
            {isDhivehi
              ? "ތިޔަ ޚިޔާލު ރިވިއުއަށް ހުށަހެޅިއްޖެ."
              : "Your comment has been submitted for review."}
          </p>
        )}
        {mutation.isError && (
          <p className="text-sm text-red-700">{mutation.error.message}</p>
        )}
      </form>
    </section>
  );
}
