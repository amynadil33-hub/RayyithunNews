import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteArticle, getAllAdminArticles, getMyArticles } from "../../services/articles.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, EyeIcon, ClipboardCheckIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ArticleStatus } from "../../lib/database.types.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import ArticleStatusBadge, { ARTICLE_STATUS_LABELS } from "../../components/admin/ArticleStatusBadge.tsx";

const ARTICLE_STATUSES = Object.keys(ARTICLE_STATUS_LABELS) as ArticleStatus[];

export default function AdminArticles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");
  const [portalFilter, setPortalFilter] = useState<"all" | "english" | "dhivehi">("all");
  const qc = useQueryClient();
  const { profile, hasRole } = useAdminAuth();
  const isAuthor = profile?.role === "author";
  const isReviewer = hasRole("editor", "admin", "super_admin");
  const canDelete = hasRole("admin", "super_admin");

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["admin-articles", profile?.id, profile?.role],
    queryFn: () => isAuthor ? getMyArticles(profile!.id) : getAllAdminArticles(),
    enabled: Boolean(profile),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article deleted");
    },
    onError: () => toast.error("Failed to delete article"),
  });

  const filtered = (articles ?? []).filter((article) => {
    if (statusFilter !== "all" && article.status !== statusFilter) return false;
    if (portalFilter !== "all" && article.portal?.slug !== portalFilter) return false;
    return !search || article.title.toLowerCase().includes(search.toLowerCase());
  });

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#142820] font-serif">
            {isAuthor ? "My Articles" : "Articles"}
          </h1>
          {isAuthor && <p className="text-sm text-[#6B756E] mt-1">Draft, submit, and track your editorial review status.</p>}
        </div>
        <div className="flex items-center gap-2">
          {isReviewer && (
            <Link to="/admin/review"
              className="flex items-center gap-2 border border-[#103820] text-[#103820] px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#F0F4F0] transition-colors">
              <ClipboardCheckIcon size={14} /> Review Queue
            </Link>
          )}
          <Link to="/admin/articles/new"
            className="flex items-center gap-2 bg-[#103820] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#183028] transition-colors">
            <PlusIcon size={14} /> New Article
          </Link>
        </div>
      </div>

      {/* Workflow status filters */}
      <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Filter articles by workflow status">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-[#103820] text-white"
              : "border border-[#E5E7E2] bg-white text-[#6B756E] hover:border-[#103820] hover:text-[#103820]"
          }`}
        >
          All
        </button>
        {ARTICLE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-[#103820] text-white"
                : "border border-[#E5E7E2] bg-white text-[#6B756E] hover:border-[#103820] hover:text-[#103820]"
            }`}
          >
            {ARTICLE_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Search and portal filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 border border-[#E5E7E2] rounded-sm bg-white px-3">
          <SearchIcon size={14} className="text-[#6B756E]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="py-2 text-sm bg-transparent focus:outline-none text-[#142820] w-48" />
        </div>
        <select value={portalFilter} onChange={(e) => setPortalFilter(e.target.value as "all" | "english" | "dhivehi")}
          className="border border-[#E5E7E2] rounded-sm px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="all">All Portals</option>
          <option value="english">English</option>
          <option value="dhivehi">Dhivehi</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E7E2] rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-red-700">Articles could not be loaded.</p>
            <p className="mt-1 text-xs text-[#6B756E]">{(error as Error).message}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B756E]">
            <p className="text-sm">No articles found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7E2] bg-[#F8F8F8]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide hidden md:table-cell">Portal</th>
                {!isAuthor && <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide hidden lg:table-cell">Author</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B756E] uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E2]">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-[#F8F8F8] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#142820] line-clamp-1 max-w-xs">{article.title}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-[#6B756E]">{article.category?.name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-medium ${article.portal?.slug === "english" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                      {article.portal?.slug === "english" ? "English" : "Dhivehi"}
                    </span>
                  </td>
                  {!isAuthor && (
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#6B756E]">{article.author?.full_name ?? "—"}</span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <ArticleStatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-[#6B756E]">
                      {article.published_at ? format(new Date(article.published_at), "d MMM yyyy") : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {article.status === "published" && (
                        <a href={article.portal?.slug === "english" ? `/en/article/${article.slug}` : `/article/${article.slug}`}
                          target="_blank" rel="noopener noreferrer"
                          title="View published article"
                          className="p-1.5 text-[#6B756E] hover:text-[#103820] rounded-sm hover:bg-[#F8F8F8]">
                          <EyeIcon size={14} />
                        </a>
                      )}
                      <Link to={`/admin/articles/edit/${article.id}`}
                        title={isAuthor && !["draft", "changes_requested"].includes(article.status) ? "View article" : "Edit article"}
                        className="p-1.5 text-[#6B756E] hover:text-[#103820] rounded-sm hover:bg-[#F8F8F8]">
                        {isAuthor && !["draft", "changes_requested"].includes(article.status)
                          ? <EyeIcon size={14} />
                          : <EditIcon size={14} />}
                      </Link>
                      {canDelete && (
                        <button onClick={() => handleDelete(article.id, article.title)}
                          className="p-1.5 text-[#6B756E] hover:text-red-600 rounded-sm hover:bg-red-50">
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
