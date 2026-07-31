import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArchiveIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  EditIcon,
  EyeIcon,
  MessageSquareWarningIcon,
} from "lucide-react";
import {
  approveArticle,
  archiveArticle,
  getReviewQueueArticles,
  markArticleInReview,
  publishArticle,
  requestArticleChanges,
} from "../../services/articles.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import ArticleStatusBadge from "../../components/admin/ArticleStatusBadge.tsx";
import { toast } from "sonner";

type ReviewAction = "in_review" | "changes_requested" | "approve" | "publish" | "archive";

interface ReviewActionInput {
  action: ReviewAction;
  articleId: string;
  notes?: string;
}

export default function ReviewQueue() {
  const { hasRole } = useAdminAuth();
  const isReviewer = hasRole("editor", "admin", "super_admin");
  const queryClient = useQueryClient();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["review-queue"],
    queryFn: getReviewQueueArticles,
    enabled: isReviewer,
  });

  const actionMutation = useMutation({
    mutationFn: ({ action, articleId, notes = "" }: ReviewActionInput) => {
      if (action === "in_review") return markArticleInReview(articleId);
      if (action === "changes_requested") return requestArticleChanges(articleId, notes);
      if (action === "approve") return approveArticle(articleId, notes);
      if (action === "publish") return publishArticle(articleId);
      return archiveArticle(articleId);
    },
    onSuccess: (_article, input) => {
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article-counts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article", input.articleId] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });

      const messages: Record<ReviewAction, string> = {
        in_review: "Article marked in review",
        changes_requested: "Changes requested from the author",
        approve: "Article approved",
        publish: "Article published",
        archive: "Article archived",
      };
      toast.success(messages[input.action]);
    },
    onError: (mutationError: Error) => toast.error(mutationError.message || "The review action failed."),
  });

  if (!isReviewer) return <Navigate to="/admin/articles" replace />;

  function runAction(action: ReviewAction, articleId: string, title: string) {
    if (action === "changes_requested") {
      const notes = window.prompt(`Changes requested for "${title}":`);
      if (notes === null) return;
      if (!notes.trim()) {
        toast.error("Add an editor note before requesting changes.");
        return;
      }
      actionMutation.mutate({ action, articleId, notes });
      return;
    }

    if (action === "approve") {
      const notes = window.prompt(`Approval note for "${title}" (optional):`, "");
      if (notes === null) return;
      actionMutation.mutate({ action, articleId, notes });
      return;
    }

    if (action === "publish" && !window.confirm(`Publish "${title}" now?`)) return;
    if (action === "archive" && !window.confirm(`Archive "${title}"?`)) return;
    actionMutation.mutate({ action, articleId });
  }

  const actionClass =
    "inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="p-6 max-w-[96rem] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheckIcon size={20} className="text-[#103820]" />
            <h1 className="text-2xl font-bold text-[#142820] font-serif">Review Queue</h1>
          </div>
          <p className="text-sm text-[#6B756E] mt-1">
            Submitted work, active reviews, requested changes, and approved stories.
          </p>
        </div>
        <Link to="/admin/articles" className="text-sm text-[#103820] hover:underline">
          All articles
        </Link>
      </div>

      <div className="bg-white border border-[#E5E7E2] rounded-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-red-700">The review queue could not be loaded.</p>
            <p className="mt-1 text-xs text-[#6B756E]">{(error as Error).message}</p>
          </div>
        ) : !articles?.length ? (
          <div className="py-16 text-center text-[#6B756E]">
            <ClipboardCheckIcon size={28} className="mx-auto mb-3 text-[#95D5B2]" />
            <p className="text-sm">The review queue is clear.</p>
          </div>
        ) : (
          <table className="w-full min-w-[1180px]">
            <thead>
              <tr className="border-b border-[#E5E7E2] bg-[#F8F8F8]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Portal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Submitted date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Last updated</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {articles.map((article) => {
                const rowBusy = actionMutation.isPending && actionMutation.variables?.articleId === article.id;
                return (
                  <tr key={article.id} className="hover:bg-[#F8F8F8] transition-colors">
                    <td className="px-4 py-3">
                      <p className="max-w-xs text-sm font-medium text-[#142820] line-clamp-2">{article.title}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B756E]">
                      {article.portal?.slug === "english" ? "English" : "Dhivehi"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B756E]">{article.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#6B756E]">
                      {article.author?.full_name ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <ArticleStatusBadge status={article.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B756E] whitespace-nowrap">
                      {article.submitted_at ? format(new Date(article.submitted_at), "d MMM yyyy, HH:mm") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B756E] whitespace-nowrap">
                      {format(new Date(article.updated_at), "d MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[430px] flex-wrap gap-1.5">
                        <Link
                          to={`/admin/articles/edit/${article.id}`}
                          className={`${actionClass} border-[#D6DED8] text-[#103820] hover:bg-[#F0F4F0]`}
                        >
                          <EditIcon size={12} /> Open
                        </Link>
                        {article.status === "submitted" && (
                          <button
                            type="button"
                            onClick={() => runAction("in_review", article.id, article.title)}
                            disabled={rowBusy}
                            className={`${actionClass} border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}
                          >
                            <ClipboardCheckIcon size={12} /> Mark In Review
                          </button>
                        )}
                        {["submitted", "in_review", "approved"].includes(article.status) && (
                          <button
                            type="button"
                            onClick={() => runAction("changes_requested", article.id, article.title)}
                            disabled={rowBusy}
                            className={`${actionClass} border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100`}
                          >
                            <MessageSquareWarningIcon size={12} /> Request Changes
                          </button>
                        )}
                        {["submitted", "in_review", "changes_requested"].includes(article.status) && (
                          <button
                            type="button"
                            onClick={() => runAction("approve", article.id, article.title)}
                            disabled={rowBusy}
                            className={`${actionClass} border-green-200 bg-green-50 text-green-800 hover:bg-green-100`}
                          >
                            <CheckCircleIcon size={12} /> Approve
                          </button>
                        )}
                        {article.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => runAction("publish", article.id, article.title)}
                            disabled={rowBusy}
                            className={`${actionClass} border-[#103820] bg-[#103820] text-white hover:bg-[#183028]`}
                          >
                            <EyeIcon size={12} /> Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => runAction("archive", article.id, article.title)}
                          disabled={rowBusy}
                          className={`${actionClass} border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100`}
                        >
                          <ArchiveIcon size={12} /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
