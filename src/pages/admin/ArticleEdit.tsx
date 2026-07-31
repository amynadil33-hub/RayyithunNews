import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveArticle,
  archiveArticle,
  createDraftArticle,
  markArticleInReview,
  publishArticle,
  requestArticleChanges,
  scheduleArticle,
  submitArticle,
  supportsArticleGalleryImages,
  adminGetArticle,
  updateArticle,
} from "../../services/articles.ts";
import { getCategories } from "../../services/categories.ts";
import { getPortalBySlug } from "../../services/settings.ts";
import { uploadArticleImage } from "../../services/media.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import ArticleStatusBadge from "../../components/admin/ArticleStatusBadge.tsx";
import {
  DEFAULT_ARTICLE_IMAGE_HEIGHT,
  MAX_ARTICLE_IMAGE_HEIGHT,
  MIN_ARTICLE_IMAGE_HEIGHT,
  getArticleImageHeight,
  getArticleImageUrl,
  setArticleImageHeight,
} from "../../lib/article-images.ts";
import { toast } from "sonner";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarClockIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  EyeIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  MessageSquareWarningIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import type { Article, ArticleStatus } from "../../lib/database.types.ts";

type WorkflowAction =
  | "save"
  | "submit"
  | "in_review"
  | "changes_requested"
  | "approve"
  | "publish"
  | "schedule"
  | "archive";

type ArticleImageField = "featured_image_url" | "additional_image_1_url" | "additional_image_2_url";

const IMAGE_FIELDS: { key: ArticleImageField; label: string; required: boolean }[] = [
  { key: "featured_image_url", label: "Hero image", required: true },
  { key: "additional_image_1_url", label: "Additional image 1", required: false },
  { key: "additional_image_2_url", label: "Additional image 2", required: false },
];

const DEFAULT_IMAGE_HEIGHTS: Record<ArticleImageField, number> = {
  featured_image_url: DEFAULT_ARTICLE_IMAGE_HEIGHT,
  additional_image_1_url: DEFAULT_ARTICLE_IMAGE_HEIGHT,
  additional_image_2_url: DEFAULT_ARTICLE_IMAGE_HEIGHT,
};

const EMPTY_ARTICLE: Partial<Article> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  additional_image_1_url: "",
  additional_image_2_url: "",
  status: "draft",
  is_breaking: false,
  is_featured: false,
  is_trending: false,
  read_time: 3,
  seo_title: "",
  seo_description: "",
  approval_notes: "",
};

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function detectArticlePortal(title?: string | null): "english" | "dhivehi" | null {
  if (!title?.trim()) return null;
  return /[\u0780-\u07BF]/.test(title) ? "dhivehi" : "english";
}

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, hasRole } = useAdminAuth();

  const isAuthor = profile?.role === "author";
  const isReviewer = hasRole("editor", "admin", "super_admin");
  const [portalSlug, setPortalSlug] = useState<"english" | "dhivehi">("dhivehi");
  const [form, setForm] = useState<Partial<Article>>(EMPTY_ARTICLE);
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploadingImage, setUploadingImage] = useState<ArticleImageField | null>(null);
  const [imageHeights, setImageHeights] = useState<Record<ArticleImageField, number>>(DEFAULT_IMAGE_HEIGHTS);

  const { data: existingArticle, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => adminGetArticle(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!existingArticle) return;
    setForm(existingArticle);
    setPortalSlug(
      detectArticlePortal(existingArticle.title)
      ?? (existingArticle.portal?.slug as "english" | "dhivehi")
      ?? "dhivehi"
    );
    setScheduledAt(toLocalDateTimeInput(existingArticle.scheduled_at));
    setImageHeights({
      featured_image_url: getArticleImageHeight(existingArticle.featured_image_url),
      additional_image_1_url: getArticleImageHeight(existingArticle.additional_image_1_url),
      additional_image_2_url: getArticleImageHeight(existingArticle.additional_image_2_url),
    });
  }, [existingArticle]);

  const { data: categories } = useQuery({
    queryKey: ["categories", portalSlug],
    queryFn: () => getCategories(portalSlug),
  });

  const { data: galleryImagesSupported = false } = useQuery({
    queryKey: ["article-gallery-image-support"],
    queryFn: supportsArticleGalleryImages,
  });

  const currentStatus: ArticleStatus = existingArticle?.status ?? form.status ?? "draft";
  const authorEditableStatus = currentStatus === "draft" || currentStatus === "changes_requested";
  const canEditContent = isReviewer || (isAuthor && (isNew || authorEditableStatus));
  const isReadOnlyAuthor = isAuthor && !canEditContent;

  async function buildPayload() {
    const resolvedPortalSlug = detectArticlePortal(form.title) ?? portalSlug;
    const portal = await getPortalBySlug(resolvedPortalSlug);
    if (!portal) throw new Error("The selected portal could not be found.");
    return { ...form, portal_id: portal.id };
  }

  async function persistEditorChanges(payload: Partial<Article>) {
    if (isNew) return createDraftArticle(payload);
    return updateArticle(id!, payload);
  }

  const workflowMutation = useMutation({
    mutationFn: async (action: WorkflowAction) => {
      const payload = await buildPayload();

      if (action === "save") {
        if (isNew) return createDraftArticle(payload);
        return updateArticle(id!, isAuthor ? { ...payload, status: "draft" } : payload);
      }

      if (action === "submit") {
        const article = isNew ? await createDraftArticle(payload) : null;
        return submitArticle(article?.id ?? id!, payload);
      }

      if (!isReviewer) throw new Error("Only editors and administrators can perform this action.");
      const savedArticle = await persistEditorChanges(payload);
      const articleId = savedArticle.id;

      if (action === "in_review") return markArticleInReview(articleId);
      if (action === "changes_requested") {
        if (!form.approval_notes?.trim()) throw new Error("Add an editor note before requesting changes.");
        return requestArticleChanges(articleId, form.approval_notes);
      }
      if (action === "approve") return approveArticle(articleId, form.approval_notes ?? "");
      if (action === "publish") return publishArticle(articleId);
      if (action === "schedule") {
        if (!scheduledAt) throw new Error("Choose a publication date and time.");
        const publicationDate = new Date(scheduledAt);
        if (Number.isNaN(publicationDate.getTime())) throw new Error("Choose a valid publication date and time.");
        return scheduleArticle(articleId, publicationDate.toISOString());
      }
      return archiveArticle(articleId);
    },
    onSuccess: (article, action) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article-counts"] });
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article", article.id] });

      const messages: Record<WorkflowAction, string> = {
        save: isAuthor ? "Draft saved" : "Article changes saved",
        submit: "Article submitted for review",
        in_review: "Article marked in review",
        changes_requested: "Changes requested",
        approve: "Article approved",
        publish: "Article published",
        schedule: "Article scheduled",
        archive: "Article archived",
      };
      toast.success(messages[action]);

      if (action === "submit" && isAuthor) {
        navigate("/admin/articles");
      } else if (isNew) {
        navigate(`/admin/articles/edit/${article.id}`, { replace: true });
      }
    },
    onError: (error: Error) => toast.error(error.message || "The article could not be updated."),
  });

  function handleSlugify() {
    if (!form.title || form.slug) return;
    setForm((current) => ({
      ...current,
      slug: current.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "",
    }));
  }

  async function handleImageUpload(key: ArticleImageField, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Images must be smaller than 10 MB.");
      return;
    }

    setUploadingImage(key);
    try {
      const asset = await uploadArticleImage(file);
      setForm((current) => ({
        ...current,
        [key]: setArticleImageHeight(asset.file_url, imageHeights[key]),
      }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploadingImage(null);
    }
  }

  function updateImageHeight(key: ArticleImageField, height: number) {
    setImageHeights((current) => ({ ...current, [key]: height }));
    setForm((current) => ({
      ...current,
      [key]: current[key] ? setArticleImageHeight(current[key] ?? "", height) : current[key],
    }));
  }

  const isBusy = workflowMutation.isPending || uploadingImage !== null;
  const actionButtonClass =
    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  if (!isNew && !isLoading && !existingArticle) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-[#6B756E]">This article is unavailable or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full max-w-5xl mx-auto p-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/articles" className="text-[#6B756E] hover:text-[#103820]">
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#142820] font-serif">
              {isNew ? "New Article" : isReadOnlyAuthor ? "View Article" : "Edit Article"}
            </h1>
            {!isNew && <div className="mt-1"><ArticleStatusBadge status={currentStatus} /></div>}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {isAuthor && canEditContent && (
            <>
              <button
                onClick={() => workflowMutation.mutate("save")}
                disabled={isBusy}
                className={`${actionButtonClass} border border-[#103820] text-[#103820] hover:bg-[#F0F4F0]`}
              >
                <SaveIcon size={14} /> Save Draft
              </button>
              <button
                onClick={() => workflowMutation.mutate("submit")}
                disabled={isBusy}
                className={`${actionButtonClass} bg-[#103820] text-white hover:bg-[#183028]`}
              >
                <SendIcon size={14} /> Submit for Review
              </button>
            </>
          )}

          {isReviewer && (
            <>
              <button
                onClick={() => workflowMutation.mutate("save")}
                disabled={isBusy}
                className={`${actionButtonClass} border border-[#103820] text-[#103820] hover:bg-[#F0F4F0]`}
              >
                <SaveIcon size={14} /> Save Changes
              </button>
              {currentStatus === "submitted" && (
                <button
                  onClick={() => workflowMutation.mutate("in_review")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-amber-100 text-amber-900 hover:bg-amber-200`}
                >
                  <ClipboardCheckIcon size={14} /> Mark In Review
                </button>
              )}
              {["submitted", "in_review", "approved"].includes(currentStatus) && (
                <button
                  onClick={() => workflowMutation.mutate("changes_requested")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-orange-100 text-orange-900 hover:bg-orange-200`}
                >
                  <MessageSquareWarningIcon size={14} /> Request Changes
                </button>
              )}
              {!["approved", "published", "archived"].includes(currentStatus) && (
                <button
                  onClick={() => workflowMutation.mutate("approve")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-green-100 text-green-900 hover:bg-green-200`}
                >
                  <CheckCircleIcon size={14} /> Approve
                </button>
              )}
              {currentStatus !== "published" && (
                <button
                  onClick={() => workflowMutation.mutate("publish")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-[#103820] text-white hover:bg-[#183028]`}
                >
                  <EyeIcon size={14} /> Publish
                </button>
              )}
              {!["published", "scheduled"].includes(currentStatus) && (
                <button
                  onClick={() => workflowMutation.mutate("schedule")}
                  disabled={isBusy || !scheduledAt}
                  className={`${actionButtonClass} bg-purple-100 text-purple-900 hover:bg-purple-200`}
                >
                  <CalendarClockIcon size={14} /> Schedule
                </button>
              )}
              {currentStatus !== "archived" && (
                <button
                  onClick={() => workflowMutation.mutate("archive")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
                >
                  <ArchiveIcon size={14} /> Archive
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isReadOnlyAuthor && (
        <div className="mb-5 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 rounded-sm">
          This article is with the editorial team. You can view it, but editing is locked until changes are requested.
        </div>
      )}

      {isAuthor && currentStatus === "changes_requested" && form.approval_notes && (
        <div className="mb-5 border border-orange-200 bg-orange-50 px-4 py-3 rounded-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-1">Editor note</p>
          <p className="text-sm text-orange-950 whitespace-pre-wrap">{form.approval_notes}</p>
        </div>
      )}

      <fieldset disabled={!canEditContent} className="grid grid-cols-1 lg:grid-cols-3 gap-6 disabled:opacity-75">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Title *</label>
              <input
                value={form.title ?? ""}
                onChange={(event) => {
                  const title = event.target.value;
                  setForm({ ...form, title });
                  const detectedPortal = detectArticlePortal(title);
                  if (detectedPortal) setPortalSlug(detectedPortal);
                }}
                onBlur={isNew ? handleSlugify : undefined}
                placeholder="Article title..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Slug</label>
              <input
                value={form.slug ?? ""}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="article-slug-here"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#103820] bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt ?? ""}
                onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                rows={3}
                placeholder="Brief description..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">Content (HTML)</label>
              <textarea
                value={form.content ?? ""}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                rows={16}
                placeholder="<p>Article body content...</p>"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#103820] resize-y disabled:bg-[#F8F8F8]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#142820]">SEO & Metadata</h3>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">SEO Title</label>
              <input
                value={form.seo_title ?? ""}
                onChange={(event) => setForm({ ...form, seo_title: event.target.value })}
                placeholder="Override title for search engines..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">SEO Description</label>
              <textarea
                value={form.seo_description ?? ""}
                onChange={(event) => setForm({ ...form, seo_description: event.target.value })}
                rows={2}
                placeholder="Meta description for search results..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">OG Image URL</label>
              <input
                value={form.og_image_url ?? ""}
                onChange={(event) => setForm({ ...form, og_image_url: event.target.value })}
                placeholder="https://..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#142820]">Publishing</h3>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Current status</label>
              <ArticleStatusBadge status={currentStatus} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Portal</label>
              <select
                value={portalSlug}
                onChange={(event) => setPortalSlug(event.target.value as "english" | "dhivehi")}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none disabled:bg-[#F8F8F8]"
              >
                <option value="english">English</option>
                <option value="dhivehi">Dhivehi</option>
              </select>
              {detectArticlePortal(form.title) && (
                <p className="mt-1 text-[11px] text-[#6B756E]">
                  Portal matched automatically to the article title language.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Category</label>
              <select
                value={form.category_id ?? ""}
                onChange={(event) => setForm({ ...form, category_id: event.target.value || undefined })}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none disabled:bg-[#F8F8F8]"
              >
                <option value="">Select category...</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">Read Time (minutes)</label>
              <input
                type="number"
                min={1}
                value={form.read_time ?? 3}
                onChange={(event) => setForm({ ...form, read_time: parseInt(event.target.value) })}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none disabled:bg-[#F8F8F8]"
              />
            </div>
            {isReviewer && (
              <div>
                <label className="block text-xs font-medium text-[#142820] mb-1">Schedule publication</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">Article Flags</h3>
            {[
              { key: "is_breaking", label: "Breaking News" },
              { key: "is_featured", label: "Featured" },
              { key: "is_trending", label: "Trending" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(event) => setForm({ ...form, [key]: event.target.checked })}
                  className="w-4 h-4 rounded border-[#E5E7E2] text-[#103820]"
                />
                <span className="text-sm text-[#142820]">{label}</span>
              </label>
            ))}
          </div>

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">Article Images</h3>
            <p className="text-xs text-[#6B756E]">
              {galleryImagesSupported
                ? "Upload a hero image and up to two gallery images directly from your device."
                : "Upload the hero image directly from your device."}
            </p>
            {(galleryImagesSupported ? IMAGE_FIELDS : IMAGE_FIELDS.slice(0, 1)).map(({ key, label, required }) => (
              <div key={key} className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-[#142820]">
                  {label}{required && <span className="text-[#6B756E]"> (featured)</span>}
                </label>
                <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-[#B9C3BC] bg-[#F8FAF8] px-3 py-4 text-center transition-colors hover:border-[#103820] hover:bg-[#F0F4F0]">
                  {uploadingImage === key ? (
                    <LoaderCircleIcon size={20} className="animate-spin text-[#103820]" />
                  ) : (
                    <ImagePlusIcon size={20} className="text-[#103820]" />
                  )}
                  <span className="text-xs font-medium text-[#142820]">
                    {uploadingImage === key ? "Uploading…" : form[key] ? "Replace image" : "Choose image"}
                  </span>
                  <span className="text-[11px] text-[#6B756E]">JPG, PNG, WebP or GIF · max 10 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingImage !== null}
                    onChange={(event) => {
                      void handleImageUpload(key, event.currentTarget.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {form[key] && (
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label htmlFor={`${key}-height`} className="text-[11px] font-medium text-[#142820]">Image height</label>
                        <span className="text-[11px] tabular-nums text-[#6B756E]">{imageHeights[key]}px</span>
                      </div>
                      <input
                        id={`${key}-height`}
                        type="range"
                        min={MIN_ARTICLE_IMAGE_HEIGHT}
                        max={MAX_ARTICLE_IMAGE_HEIGHT}
                        step={10}
                        value={imageHeights[key]}
                        onChange={(event) => updateImageHeight(key, Number(event.target.value))}
                        className="w-full accent-[#103820]"
                      />
                      <p className="mt-1 text-[10px] text-[#6B756E]">Drag to resize from {MIN_ARTICLE_IMAGE_HEIGHT}px to {MAX_ARTICLE_IMAGE_HEIGHT}px. Recommended: 450–500px.</p>
                    </div>
                    <div className="relative overflow-hidden rounded-sm bg-[#E5E7E2]">
                      <img
                        src={getArticleImageUrl(form[key])}
                        alt={`${label} preview`}
                        className="w-full object-cover"
                        style={{ height: imageHeights[key] }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, [key]: "" }))}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-700 shadow-sm hover:bg-white"
                        aria-label={`Remove ${label.toLowerCase()}`}
                      >
                        <Trash2Icon size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(isReviewer || form.approval_notes) && (
            <div className="bg-white border border-[#E5E7E2] rounded-sm p-5">
              <label className="block text-sm font-semibold text-[#142820] mb-2">Editor note</label>
              <textarea
                value={form.approval_notes ?? ""}
                onChange={(event) => setForm({ ...form, approval_notes: event.target.value })}
                rows={5}
                placeholder={isReviewer ? "Add feedback or approval context..." : "No editor note yet."}
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-y disabled:bg-[#F8F8F8]"
              />
              {isReviewer && (
                <p className="text-xs text-[#6B756E] mt-2">This note is visible to the article author.</p>
              )}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}
