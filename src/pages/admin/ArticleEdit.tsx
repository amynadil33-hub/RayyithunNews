import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetArticle, createArticle, updateArticle } from "../../services/articles.ts";
import { getCategories } from "../../services/categories.ts";
import { getPortalBySlug } from "../../services/settings.ts";
import { toast } from "sonner";
import { ArrowLeftIcon, SaveIcon, EyeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article, ArticleStatus } from "../../lib/database.types.ts";

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [portalSlug, setPortalSlug] = useState<"english" | "dhivehi">("english");
  const [form, setForm] = useState<Partial<Article>>({
    title: "", slug: "", excerpt: "", content: "",
    featured_image_url: "", additional_image_1_url: "", additional_image_2_url: "",
    status: "draft" as ArticleStatus,
    is_breaking: false, is_featured: false, is_trending: false,
    read_time: 3, seo_title: "", seo_description: "",
  });

  // Load existing article
  const { data: existingArticle } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => adminGetArticle(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingArticle) {
      setForm(existingArticle);
      setPortalSlug((existingArticle.portal?.slug as "english" | "dhivehi") ?? "english");
    }
  }, [existingArticle]);

  const { data: categories } = useQuery({
    queryKey: ["categories", portalSlug],
    queryFn: () => getCategories(portalSlug),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const portal = await getPortalBySlug(portalSlug);
      const payload = { ...form, portal_id: portal?.id };
      if (isNew) return createArticle(payload);
      return updateArticle(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(isNew ? "Article created" : "Article saved");
      if (isNew) navigate("/admin/articles");
    },
    onError: () => toast.error("Failed to save article"),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const portal = await getPortalBySlug(portalSlug);
      const payload = { ...form, portal_id: portal?.id, status: "published" as ArticleStatus, published_at: new Date().toISOString() };
      if (isNew) return createArticle(payload);
      return updateArticle(id!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article published!");
      navigate("/admin/articles");
    },
    onError: () => toast.error("Failed to publish article"),
  });

  function handleSlugify() {
    if (form.title) {
      setForm({ ...form, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/articles" className="text-[#6B756E] hover:text-[#103820]">
            <ArrowLeftIcon size={18} />
          </Link>
          <h1 className="text-xl font-bold text-[#142820] font-serif">
            {isNew ? "New Article" : "Edit Article"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="flex items-center gap-2 border border-[#103820] text-[#103820] px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#F0F4F0] transition-colors disabled:opacity-60">
            <SaveIcon size={14} /> Save Draft
          </button>
          <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}
            className="flex items-center gap-2 bg-[#103820] text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#183028] transition-colors disabled:opacity-60">
            <EyeIcon size={14} /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Title *</label>
              <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })}
                onBlur={isNew ? handleSlugify : undefined}
                placeholder="Article title..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Slug</label>
              <input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="article-slug-here"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#103820] bg-[#F8F8F8]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Excerpt</label>
              <textarea value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3} placeholder="Brief description..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Content (HTML)</label>
              <textarea value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={16} placeholder="<p>Article body content...</p>"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#103820] resize-y" />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#142820]">SEO & Metadata</h3>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">SEO Title</label>
              <input value={form.seo_title ?? ""} onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                placeholder="Override title for search engines..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">SEO Description</label>
              <textarea value={form.seo_description ?? ""} onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                rows={2} placeholder="Meta description for search results..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">OG Image URL</label>
              <input value={form.og_image_url ?? ""} onChange={(e) => setForm({ ...form, og_image_url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820]" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Portal + Status */}
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#142820]">Publishing</h3>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Portal</label>
              <select value={portalSlug} onChange={(e) => setPortalSlug(e.target.value as "english" | "dhivehi")}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none">
                <option value="english">English</option>
                <option value="dhivehi">Dhivehi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Status</label>
              <select value={form.status ?? "draft"} onChange={(e) => setForm({ ...form, status: e.target.value as ArticleStatus })}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Category</label>
              <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || undefined })}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Select category...</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Read Time (minutes)</label>
              <input type="number" min={1} value={form.read_time ?? 3} onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) })}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">Article Flags</h3>
            {[
              { key: "is_breaking", label: "Breaking News" },
              { key: "is_featured", label: "Featured" },
              { key: "is_trending", label: "Trending" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E7E2] text-[#103820]" />
                <span className="text-sm text-[#142820]">{label}</span>
              </label>
            ))}
          </div>

          {/* Article images */}
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">Article Images</h3>
            <p className="text-xs text-[#6B756E]">Add a hero image and up to two images for the article gallery.</p>
            {([
              { key: "featured_image_url", label: "Hero image", required: true },
              { key: "additional_image_1_url", label: "Additional image 1", required: false },
              { key: "additional_image_2_url", label: "Additional image 2", required: false },
            ] as const).map(({ key, label, required }) => (
              <div key={key} className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-[#142820]">
                  {label}{required && <span className="text-[#6B756E]"> (featured)</span>}
                </label>
                <input
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder="https://..."
                  inputMode="url"
                  className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#103820]"
                />
                {form[key] && (
                  <img src={form[key] ?? ""} alt={`${label} preview`} className="w-full h-32 object-cover rounded-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
