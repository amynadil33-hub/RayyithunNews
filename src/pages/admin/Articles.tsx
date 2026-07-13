import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getArticles, deleteArticle } from "../../services/articles.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, EyeIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ArticleStatus } from "../../lib/database.types.ts";

const STATUS_COLORS: Record<ArticleStatus, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
};

export default function AdminArticles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");
  const [portalFilter, setPortalFilter] = useState<"all" | "english" | "dhivehi">("all");
  const qc = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles", statusFilter, portalFilter],
    queryFn: () => getArticles({
      status: statusFilter === "all" ? undefined : statusFilter,
      includeAllStatuses: statusFilter === "all",
      portalSlug: portalFilter === "all" ? undefined : portalFilter,
      limit: 50,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article deleted");
    },
    onError: () => toast.error("Failed to delete article"),
  });

  const filtered = (articles ?? []).filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#142820] font-serif">Articles</h1>
        <Link to="/admin/articles/new"
          className="flex items-center gap-2 bg-[#103820] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#183028] transition-colors">
          <PlusIcon size={14} /> New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 border border-[#E5E7E2] rounded-sm bg-white px-3">
          <SearchIcon size={14} className="text-[#6B756E]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="py-2 text-sm bg-transparent focus:outline-none text-[#142820] w-48" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ArticleStatus | "all")}
          className="border border-[#E5E7E2] rounded-sm px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
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
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-medium capitalize ${STATUS_COLORS[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-[#6B756E]">
                      {article.published_at ? format(new Date(article.published_at), "d MMM yyyy") : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a href={article.portal?.slug === "english" ? `/en/article/${article.slug}` : `/article/${article.slug}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-[#6B756E] hover:text-[#103820] rounded-sm hover:bg-[#F8F8F8]">
                        <EyeIcon size={14} />
                      </a>
                      <Link to={`/admin/articles/edit/${article.id}`}
                        className="p-1.5 text-[#6B756E] hover:text-[#103820] rounded-sm hover:bg-[#F8F8F8]">
                        <EditIcon size={14} />
                      </Link>
                      <button onClick={() => handleDelete(article.id, article.title)}
                        className="p-1.5 text-[#6B756E] hover:text-red-600 rounded-sm hover:bg-red-50">
                        <TrashIcon size={14} />
                      </button>
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
