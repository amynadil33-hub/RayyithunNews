import type { ArticleStatus } from "../../lib/database.types.ts";

export const ARTICLE_STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  in_review: "bg-amber-100 text-amber-800",
  changes_requested: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  published: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-purple-100 text-purple-800",
  archived: "bg-gray-100 text-gray-500",
};

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

export default function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${ARTICLE_STATUS_STYLES[status]}`}>
      {ARTICLE_STATUS_LABELS[status]}
    </span>
  );
}
