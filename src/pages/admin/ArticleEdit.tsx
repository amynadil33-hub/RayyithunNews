import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/table";
import "tinymce/plugins/code";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/directionality";
import "tinymce/skins/ui/oxide/skin.min.css";
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
import ArticleLiveUpdates from "../../components/admin/ArticleLiveUpdates.tsx";
import {
  DEFAULT_ARTICLE_IMAGE_HEIGHT,
  MAX_ARTICLE_IMAGE_HEIGHT,
  MIN_ARTICLE_IMAGE_HEIGHT,
  getArticleImageHeight,
  getArticleImageUrl,
  setArticleImageHeight,
} from "../../lib/article-images.ts";
import { sanitizeArticleHtml } from "../../lib/sanitizeHtml.ts";
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
import {
  createTag,
  getTags,
  getTagsForArticle,
  setArticleTags,
  tagSlug,
} from "../../services/tags.ts";

type WorkflowAction =
  | "save"
  | "submit"
  | "in_review"
  | "changes_requested"
  | "approve"
  | "publish"
  | "schedule"
  | "archive";

type ArticleImageField =
  "featured_image_url" | "additional_image_1_url" | "additional_image_2_url";
type ArticleImageCreditField =
  | "featured_image_credit"
  | "additional_image_1_credit"
  | "additional_image_2_credit";

const IMAGE_FIELDS: {
  key: ArticleImageField;
  creditKey?: ArticleImageCreditField;
  label: string;
  required: boolean;
}[] = [
  {
    key: "featured_image_url",
    creditKey: "featured_image_credit",
    label: "Hero image",
    required: true,
  },
  {
    key: "additional_image_1_url",
    creditKey: "additional_image_1_credit",
    label: "First article image (inside story)",
    required: false,
  },
  {
    key: "additional_image_2_url",
    creditKey: "additional_image_2_credit",
    label: "Second article image (inside story)",
    required: false,
  },
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
  featured_image_caption: "",
  featured_image_credit: "",
  additional_image_1_url: "",
  additional_image_1_credit: "",
  additional_image_2_url: "",
  additional_image_2_credit: "",
  status: "draft",
  is_breaking: false,
  is_featured: false,
  is_trending: false,
  show_author: true,
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

function detectArticlePortal(
  title?: string | null,
): "english" | "dhivehi" | null {
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
  const [portalSlug, setPortalSlug] = useState<"english" | "dhivehi">(
    "dhivehi",
  );
  const [form, setForm] = useState<Partial<Article>>(EMPTY_ARTICLE);
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [quickTagName, setQuickTagName] = useState("");
  const [uploadingImage, setUploadingImage] =
    useState<ArticleImageField | null>(null);
  const [imageHeights, setImageHeights] = useState<
    Record<ArticleImageField, number>
  >(DEFAULT_IMAGE_HEIGHTS);

  const { data: existingArticle, isLoading } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => adminGetArticle(id!),
    enabled: !isNew,
  });

  const { data: galleryImagesSupported = false } = useQuery({
    queryKey: ["article-gallery-image-support"],
    queryFn: supportsArticleGalleryImages,
  });

  useEffect(() => {
    if (!existingArticle) return;
    setForm(existingArticle);
    setPortalSlug(
      detectArticlePortal(existingArticle.title) ??
        (existingArticle.portal?.slug as "english" | "dhivehi") ??
        "dhivehi",
    );
    setScheduledAt(toLocalDateTimeInput(existingArticle.scheduled_at));
    setImageHeights({
      featured_image_url: getArticleImageHeight(
        existingArticle.featured_image_url,
      ),
      additional_image_1_url: getArticleImageHeight(
        existingArticle.additional_image_1_url,
      ),
      additional_image_2_url: getArticleImageHeight(
        existingArticle.additional_image_2_url,
      ),
    });
  }, [existingArticle]);

  const { data: categories } = useQuery({
    queryKey: ["categories", portalSlug],
    queryFn: () => getCategories(portalSlug),
  });

  const { data: selectedPortal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => getPortalBySlug(portalSlug),
  });

  const { data: availableTags } = useQuery({
    queryKey: ["tags", selectedPortal?.id],
    queryFn: () => getTags(selectedPortal!.id),
    enabled: Boolean(selectedPortal?.id),
  });

  const { data: existingTags } = useQuery({
    queryKey: ["article-tags", id],
    queryFn: () => getTagsForArticle(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existingTags) setSelectedTagIds(existingTags.map((tag) => tag.id));
  }, [existingTags]);

  const quickTagMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPortal) throw new Error("Select a portal first.");
      const name = quickTagName.trim();
      if (!name) throw new Error("Enter a tag name.");
      return createTag({
        portal_id: selectedPortal.id,
        name,
        slug: tagSlug(name),
      });
    },
    onSuccess: (tag) => {
      setSelectedTagIds((current) => [...new Set([...current, tag.id])]);
      setQuickTagName("");
      void queryClient.invalidateQueries({
        queryKey: ["tags", selectedPortal?.id],
      });
      toast.success("Tag created and selected");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const currentStatus: ArticleStatus =
    existingArticle?.status ?? form.status ?? "draft";
  const authorEditableStatus =
    currentStatus === "draft" || currentStatus === "changes_requested";
  const canEditContent =
    isReviewer || (isAuthor && (isNew || authorEditableStatus));
  const isReadOnlyAuthor = isAuthor && !canEditContent;

  async function buildPayload() {
    const resolvedPortalSlug = detectArticlePortal(form.title) ?? portalSlug;
    const portal = await getPortalBySlug(resolvedPortalSlug);
    if (!portal) throw new Error("The selected portal could not be found.");
    if (!form.category_id) {
      throw new Error("Select a category before saving the article.");
    }
    const portalCategories = await getCategories(resolvedPortalSlug);
    const selectedCategory = portalCategories.find(
      (category) =>
        category.id === form.category_id && category.portal_id === portal.id,
    );
    if (!selectedCategory) {
      throw new Error(
        "The selected category does not belong to this portal. Select a valid category and try again.",
      );
    }
    return {
      ...form,
      content: sanitizeArticleHtml(form.content),
      portal_id: portal.id,
      category_id: selectedCategory.id,
    };
  }

  function changePortal(nextPortal: "english" | "dhivehi") {
    if (nextPortal !== portalSlug) {
      setForm((current) => ({ ...current, category_id: undefined }));
      setSelectedTagIds([]);
    }
    setPortalSlug(nextPortal);
  }

  async function persistEditorChanges(payload: Partial<Article>) {
    const article = isNew
      ? await createDraftArticle(payload)
      : await updateArticle(id!, payload);
    await setArticleTags(article.id, selectedTagIds);
    return article;
  }

  const workflowMutation = useMutation({
    mutationFn: async (action: WorkflowAction) => {
      const payload = await buildPayload();

      if (action === "save") {
        const article = isNew
          ? await createDraftArticle(payload)
          : await updateArticle(
              id!,
              isAuthor ? { ...payload, status: "draft" } : payload,
            );
        await setArticleTags(article.id, selectedTagIds);
        return article;
      }

      if (action === "submit") {
        const article = isNew ? await createDraftArticle(payload) : null;
        const submitted = await submitArticle(article?.id ?? id!, payload);
        await setArticleTags(submitted.id, selectedTagIds);
        return submitted;
      }

      if (!isReviewer)
        throw new Error(
          "Only editors and administrators can perform this action.",
        );
      const savedArticle = await persistEditorChanges(payload);
      const articleId = savedArticle.id;

      if (action === "in_review") return markArticleInReview(articleId);
      if (action === "changes_requested") {
        if (!form.approval_notes?.trim())
          throw new Error("Add an editor note before requesting changes.");
        return requestArticleChanges(articleId, form.approval_notes);
      }
      if (action === "approve")
        return approveArticle(articleId, form.approval_notes ?? "");
      if (action === "publish") return publishArticle(articleId);
      if (action === "schedule") {
        if (!scheduledAt)
          throw new Error("Choose a publication date and time.");
        const publicationDate = new Date(scheduledAt);
        if (Number.isNaN(publicationDate.getTime()))
          throw new Error("Choose a valid publication date and time.");
        return scheduleArticle(articleId, publicationDate.toISOString());
      }
      return archiveArticle(articleId);
    },
    onSuccess: (article, action) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-article-counts"] });
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-article", article.id],
      });

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
    onError: (error: Error) =>
      toast.error(error.message || "The article could not be updated."),
  });

  function handleSlugify() {
    if (!form.title || form.slug) return;
    setForm((current) => ({
      ...current,
      slug:
        current.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ?? "",
    }));
  }

  async function handleImageUpload(key: ArticleImageField, file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose a PNG, JPG, JPEG, or WebP image.");
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
      toast.error(
        error instanceof Error
          ? error.message
          : "The image could not be uploaded.",
      );
    } finally {
      setUploadingImage(null);
    }
  }

  function updateImageHeight(key: ArticleImageField, height: number) {
    setImageHeights((current) => ({ ...current, [key]: height }));
    setForm((current) => ({
      ...current,
      [key]: current[key]
        ? setArticleImageHeight(current[key] ?? "", height)
        : current[key],
    }));
  }

  const isBusy = workflowMutation.isPending || uploadingImage !== null;
  const actionButtonClass =
    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  if (!isNew && !isLoading && !existingArticle) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-[#6B756E]">
          This article is unavailable or you do not have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full max-w-5xl mx-auto p-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/articles"
            className="text-[#6B756E] hover:text-[#103820]"
          >
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#142820] font-serif">
              {isNew
                ? "New Article"
                : isReadOnlyAuthor
                  ? "View Article"
                  : "Edit Article"}
            </h1>
            {!isNew && (
              <div className="mt-1">
                <ArticleStatusBadge status={currentStatus} />
              </div>
            )}
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
              {["submitted", "in_review", "approved"].includes(
                currentStatus,
              ) && (
                <button
                  onClick={() => workflowMutation.mutate("changes_requested")}
                  disabled={isBusy}
                  className={`${actionButtonClass} bg-orange-100 text-orange-900 hover:bg-orange-200`}
                >
                  <MessageSquareWarningIcon size={14} /> Request Changes
                </button>
              )}
              {!["approved", "published", "archived"].includes(
                currentStatus,
              ) && (
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
          This article is with the editorial team. You can view it, but editing
          is locked until changes are requested.
        </div>
      )}

      {isAuthor &&
        currentStatus === "changes_requested" &&
        form.approval_notes && (
          <div className="mb-5 border border-orange-200 bg-orange-50 px-4 py-3 rounded-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-800 mb-1">
              Editor note
            </p>
            <p className="text-sm text-orange-950 whitespace-pre-wrap">
              {form.approval_notes}
            </p>
          </div>
        )}

      <fieldset
        disabled={!canEditContent}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 disabled:opacity-75"
      >
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">
                Title *
              </label>
              <input
                value={form.title ?? ""}
                onChange={(event) => {
                  const title = event.target.value;
                  const detectedPortal = detectArticlePortal(title);
                  const portalChanged = Boolean(
                    detectedPortal && detectedPortal !== portalSlug,
                  );
                  setForm((current) => ({
                    ...current,
                    title,
                    ...(portalChanged ? { category_id: undefined } : {}),
                  }));
                  if (detectedPortal) {
                    if (portalChanged) setSelectedTagIds([]);
                    setPortalSlug(detectedPortal);
                  }
                }}
                onBlur={isNew ? handleSlugify : undefined}
                placeholder="Article title..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">
                Slug
              </label>
              <input
                value={form.slug ?? ""}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value })
                }
                placeholder="article-slug-here"
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#103820] bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">
                Excerpt
              </label>
              <textarea
                value={form.excerpt ?? ""}
                onChange={(event) =>
                  setForm({ ...form, excerpt: event.target.value })
                }
                rows={3}
                placeholder="Brief description..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142820] mb-1.5">
                Article body
              </label>
              <Editor
                key={portalSlug}
                licenseKey="gpl"
                value={form.content ?? ""}
                disabled={!canEditContent}
                onEditorChange={(content) =>
                  setForm((current) => ({ ...current, content }))
                }
                init={{
                  skin: false,
                  content_css: false,
                  min_height: 420,
                  menubar: "file edit view insert format tools table",
                  plugins:
                    "lists link image table code autoresize directionality",
                  toolbar:
                    "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | blockquote | link inlinearticleimage table | removeformat | code",
                  block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3",
                  directionality: portalSlug === "dhivehi" ? "rtl" : "ltr",
                  formats: {
                    alignleft: {
                      selector: "p,h2,h3,h4,div,blockquote,li,th,td",
                      classes: "article-align-left",
                    },
                    aligncenter: {
                      selector: "p,h2,h3,h4,div,blockquote,li,th,td",
                      classes: "article-align-center",
                    },
                    alignright: {
                      selector: "p,h2,h3,h4,div,blockquote,li,th,td",
                      classes: "article-align-right",
                    },
                    alignjustify: {
                      selector: "p,h2,h3,h4,div,blockquote,li,th,td",
                      classes: "article-align-justify",
                    },
                  },
                  setup: (editor) => {
                    editor.ui.registry.addButton("inlinearticleimage", {
                      icon: "image",
                      text: "Add photo",
                      tooltip: "Insert an image at the cursor",
                      onAction: () => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".png,.jpg,.jpeg,.webp";
                        input.addEventListener("change", () => {
                          const file = input.files?.[0];
                          if (!file) return;
                          if (
                            !["image/png", "image/jpeg", "image/webp"].includes(
                              file.type,
                            )
                          ) {
                            toast.error(
                              "Choose a PNG, JPG, JPEG, or WebP image.",
                            );
                            return;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Images must be smaller than 10 MB.");
                            return;
                          }

                          editor.setProgressState(true);
                          void uploadArticleImage(file)
                            .then((asset) => {
                              const image = document.createElement("img");
                              image.src = asset.file_url;
                              image.alt = file.name.replace(/\.[^.]+$/, "");
                              editor.insertContent(`${image.outerHTML}<p></p>`);
                              toast.success("Image inserted into the article");
                            })
                            .catch((error: unknown) => {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "The image could not be uploaded.",
                              );
                            })
                            .finally(() => editor.setProgressState(false));
                        });
                        input.click();
                      },
                    });
                  },
                  content_style:
                    portalSlug === "dhivehi"
                      ? `@font-face { font-family: "MV Faseyha"; src: url("/fonts/MV_Faseyha.otf") format("opentype"); font-weight: 400; font-style: normal; font-display: swap; } body { font-family: "MV Faseyha", "MV Waheed", "MV Amaan XP", "Faruma", "Noto Sans Thaana", sans-serif; direction: rtl; text-align: right; line-height: 1.9; font-size: 20px; padding: 12px; } p { margin: 0 0 1.25rem; } blockquote { border-right: 4px solid #103820; background: #D8E8D8; margin: 1.5rem 0; padding: 1rem 1.25rem; } img { max-width: 100%; height: auto; } .article-align-left { text-align: left; } .article-align-center { text-align: center; } .article-align-right { text-align: right; } .article-align-justify { text-align: justify; }`
                      : `body { font-family: Inter, Arial, sans-serif; direction: ltr; text-align: left; line-height: 1.8; font-size: 17px; padding: 12px; } p { margin: 0 0 1.25rem; } blockquote { border-left: 4px solid #103820; background: #D8E8D8; margin: 1.5rem 0; padding: 1rem 1.25rem; } img { max-width: 100%; height: auto; } .article-align-left { text-align: left; } .article-align-center { text-align: center; } .article-align-right { text-align: right; } .article-align-justify { text-align: justify; }`,
                  image_caption: true,
                  file_picker_types: "image",
                  automatic_uploads: true,
                  images_upload_handler: async (blobInfo) => {
                    const imageFile = new File(
                      [blobInfo.blob()],
                      blobInfo.filename(),
                      { type: blobInfo.blob().type },
                    );
                    const asset = await uploadArticleImage(imageFile);
                    return asset.file_url;
                  },
                }}
              />
              <p className="mt-1.5 text-[11px] text-[#6B756E]">
                Place the cursor between two paragraphs and use the image button
                to insert another photo inside the story.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#142820]">
              SEO & Metadata
            </h3>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">
                SEO Title
              </label>
              <input
                value={form.seo_title ?? ""}
                onChange={(event) =>
                  setForm({ ...form, seo_title: event.target.value })
                }
                placeholder="Override title for search engines..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">
                SEO Description
              </label>
              <textarea
                value={form.seo_description ?? ""}
                onChange={(event) =>
                  setForm({ ...form, seo_description: event.target.value })
                }
                rows={2}
                placeholder="Meta description for search results..."
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-none disabled:bg-[#F8F8F8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">
                OG Image URL
              </label>
              <input
                value={form.og_image_url ?? ""}
                onChange={(event) =>
                  setForm({ ...form, og_image_url: event.target.value })
                }
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
              <label className="block text-xs font-medium text-[#142820] mb-1">
                Current status
              </label>
              <ArticleStatusBadge status={currentStatus} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">
                Portal
              </label>
              <select
                value={portalSlug}
                onChange={(event) =>
                  changePortal(event.target.value as "english" | "dhivehi")
                }
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
              <label className="block text-xs font-medium text-[#142820] mb-1">
                Category
              </label>
              <select
                value={form.category_id ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category_id: event.target.value || undefined,
                  })
                }
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none disabled:bg-[#F8F8F8]"
              >
                <option value="">Select category...</option>
                {(categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#142820] mb-1">
                Read Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={form.read_time ?? 3}
                onChange={(event) =>
                  setForm({ ...form, read_time: parseInt(event.target.value) })
                }
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none disabled:bg-[#F8F8F8]"
              />
            </div>
            {isReviewer && (
              <div>
                <label className="block text-xs font-medium text-[#142820] mb-1">
                  Schedule publication
                </label>
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
            <h3 className="text-sm font-semibold text-[#142820]">
              Article Flags
            </h3>
            {[
              { key: "is_breaking", label: "Breaking News" },
              { key: "is_featured", label: "Featured" },
              { key: "is_trending", label: "Trending" },
              { key: "show_author", label: "Show writer name publicly" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={Boolean(form[key as keyof typeof form])}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#E5E7E2] text-[#103820]"
                />
                <span className="text-sm text-[#142820]">{label}</span>
              </label>
            ))}
          </div>

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">
              Article Images
            </h3>
            <p className="text-xs text-[#6B756E]">
              {galleryImagesSupported
                ? "Upload a hero image and up to two article images. Article images appear between story sections in one responsive reading flow."
                : "Upload the hero image directly from your device. Run the article image database migration to enable both article images."}
            </p>
            {IMAGE_FIELDS.map(({ key, creditKey, label, required }) => (
              <div key={key} className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-[#142820]">
                  {label}
                  {required && (
                    <span className="text-[#6B756E]"> (featured)</span>
                  )}
                </label>
                <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-[#B9C3BC] bg-[#F8FAF8] px-3 py-4 text-center transition-colors hover:border-[#103820] hover:bg-[#F0F4F0]">
                  {uploadingImage === key ? (
                    <LoaderCircleIcon
                      size={20}
                      className="animate-spin text-[#103820]"
                    />
                  ) : (
                    <ImagePlusIcon size={20} className="text-[#103820]" />
                  )}
                  <span className="text-xs font-medium text-[#142820]">
                    {!galleryImagesSupported && key !== "featured_image_url"
                      ? "Database upgrade required"
                      : uploadingImage === key
                      ? "Uploading…"
                      : form[key]
                        ? "Replace image"
                        : "Choose image"}
                  </span>
                  <span className="text-[11px] text-[#6B756E]">
                    JPG, PNG, WebP or GIF · max 10 MB
                  </span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="sr-only"
                    disabled={
                      uploadingImage !== null ||
                      (!galleryImagesSupported && key !== "featured_image_url")
                    }
                    onChange={(event) => {
                      void handleImageUpload(
                        key,
                        event.currentTarget.files?.[0],
                      );
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {form[key] && (
                  <div className="space-y-2">
                    <div>
                      {key === "featured_image_url" && (
                        <div className="mb-2">
                          <label
                            htmlFor="featured-image-caption"
                            className="block text-[11px] font-medium text-[#142820] mb-1"
                          >
                            Image caption
                          </label>
                          <input
                            id="featured-image-caption"
                            value={form.featured_image_caption ?? ""}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                featured_image_caption: event.target.value,
                              }))
                            }
                            placeholder="Describe the cover photo"
                            className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#103820]"
                          />
                        </div>
                      )}
                      {creditKey && (
                        <>
                          <label
                            htmlFor={`${key}-credit`}
                            className="block text-[11px] font-medium text-[#142820] mb-1"
                          >
                            Photo credit{" "}
                            <span className="text-[#6B756E]">(optional)</span>
                          </label>
                          <input
                            id={`${key}-credit`}
                            value={form[creditKey] ?? ""}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                [creditKey]: event.target.value,
                              }))
                            }
                            placeholder="Photo: Photographer or source"
                            className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#103820] disabled:bg-[#F8F8F8]"
                          />
                          <p className="mt-1 text-[10px] text-[#6B756E]">
                            When provided, this line appears directly below the
                            image in the article.
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label
                          htmlFor={`${key}-height`}
                          className="text-[11px] font-medium text-[#142820]"
                        >
                          Image height
                        </label>
                        <span className="text-[11px] tabular-nums text-[#6B756E]">
                          {imageHeights[key]}px
                        </span>
                      </div>
                      <input
                        id={`${key}-height`}
                        type="range"
                        min={MIN_ARTICLE_IMAGE_HEIGHT}
                        max={MAX_ARTICLE_IMAGE_HEIGHT}
                        step={10}
                        value={imageHeights[key]}
                        onChange={(event) =>
                          updateImageHeight(key, Number(event.target.value))
                        }
                        className="w-full accent-[#103820]"
                      />
                      <p className="mt-1 text-[10px] text-[#6B756E]">
                        Drag to resize from {MIN_ARTICLE_IMAGE_HEIGHT}px to{" "}
                        {MAX_ARTICLE_IMAGE_HEIGHT}px. Recommended: 450–500px.
                      </p>
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
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            [key]: "",
                            ...(creditKey ? { [creditKey]: "" } : {}),
                            ...(key === "featured_image_url"
                              ? { featured_image_caption: "" }
                              : {}),
                          }))
                        }
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

          <div className="bg-white border border-[#E5E7E2] rounded-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#142820]">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags?.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((current) =>
                        selected
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs ${selected ? "border-[#103820] bg-[#103820] text-white" : "border-[#C8D1CA] text-[#526159]"}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {!availableTags?.length && (
                <p className="text-xs text-[#6B756E]">
                  No tags for this portal yet.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={quickTagName}
                onChange={(event) => setQuickTagName(event.target.value)}
                placeholder="Create a tag"
                className="min-w-0 flex-1 border border-[#E5E7E2] px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => quickTagMutation.mutate()}
                disabled={!quickTagName.trim() || quickTagMutation.isPending}
                className="bg-[#103820] px-3 py-2 text-xs text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {!isNew && form.is_breaking && isReviewer && id && (
            <ArticleLiveUpdates articleId={id} />
          )}

          {(isReviewer || form.approval_notes) && (
            <div className="bg-white border border-[#E5E7E2] rounded-sm p-5">
              <label className="block text-sm font-semibold text-[#142820] mb-2">
                Editor note
              </label>
              <textarea
                value={form.approval_notes ?? ""}
                onChange={(event) =>
                  setForm({ ...form, approval_notes: event.target.value })
                }
                rows={5}
                placeholder={
                  isReviewer
                    ? "Add feedback or approval context..."
                    : "No editor note yet."
                }
                className="w-full border border-[#E5E7E2] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#103820] resize-y disabled:bg-[#F8F8F8]"
              />
              {isReviewer && (
                <p className="text-xs text-[#6B756E] mt-2">
                  This note is visible to the article author.
                </p>
              )}
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
}
