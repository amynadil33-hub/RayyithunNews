import { Link } from "react-router-dom";
import type { Article } from "../../lib/database.types.ts";
import AuthorIdentity from "../shared/AuthorIdentity.tsx";
import { getPublicAuthorName } from "../../lib/author-display.ts";
import {
  formatDhivehiDate,
  formatDhivehiRelativeTime,
} from "../../lib/dhivehi-date.ts";
import { formatRelativeAge } from "../../lib/article-time.ts";

interface DhivehiArticleCardProps {
  article: Article;
  variant?: "hero" | "secondary" | "grid" | "compact" | "trending";
  index?: number;
  showHoursOnly?: boolean;
}

export default function DhivehiArticleCard({
  article,
  variant = "grid",
  index,
  showHoursOnly = false,
}: DhivehiArticleCardProps) {
  const href = `/article/${article.slug}`;
  const date = article.published_at
    ? variant === "hero"
      ? formatDhivehiRelativeTime(article.published_at)
      : formatDhivehiDate(article.published_at)
    : "";
  const authorName = article.show_author
    ? getPublicAuthorName(article.author, true)
    : null;
  const hoursAgo = article.published_at
    ? formatRelativeAge(article.published_at, true)
    : "";

  if (variant === "hero") {
    return (
      <Link
        to={href}
        className="group block relative w-full max-w-full min-w-0 overflow-hidden rounded-sm bg-[#103820] aspect-[4/3] md:aspect-auto md:h-full min-h-[400px]"
        dir="rtl"
      >
        {article.featured_image_url && (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity group-hover:opacity-95"
            loading="lazy"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-[#061C10]/90 via-[#103820]/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          {article.is_breaking && (
            <span className="breaking-badge inline-block mb-2">
              ކުއްލި ހަބަރު
            </span>
          )}
          {article.category && (
            <span className="category-label text-[#95D5B2] block mb-2 font-thaana">
              {article.category.name}
            </span>
          )}
          <h2 className="font-article-title ml-auto mr-0 max-w-[32rem] text-[2rem] font-bold leading-[1.35] text-white line-clamp-3 text-balance mb-2 transition-colors group-hover:text-[#95D5B2] md:text-[2.5rem]">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="thaana-body ml-auto mr-0 max-w-[28rem] text-sm text-white/85 line-clamp-2 mb-3">
              {article.excerpt}
            </p>
          )}
          <div className="ml-auto mr-0 flex max-w-[28rem] items-center gap-2 text-xs text-white/70 font-thaana flex-row-reverse">
            {showHoursOnly ? (
              hoursAgo && <span>{hoursAgo}</span>
            ) : (
              <>
                {authorName && (
                  <AuthorIdentity author={article.author} isDhivehi />
                )}
                {date && <span>{date}</span>}
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        to={href}
        className="group flex min-w-0 max-w-full gap-3 items-start flex-row-reverse"
        dir="rtl"
      >
        {article.featured_image_url ? (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-32 h-24 object-cover rounded-sm flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-32 h-24 bg-[#D8E8D8] flex-shrink-0 rounded-sm flex items-center justify-center">
            <span className="font-thaana text-[#103820] text-xs font-bold">
              ރ
            </span>
          </div>
        )}
        <div className="text-right">
          {article.category && (
            <span className="category-label block mb-1 font-thaana">
              {article.category.name}
            </span>
          )}
          <h3 className="font-article-title text-xl font-semibold text-[#142820] group-hover:text-[#103820] transition-colors line-clamp-3">
            {article.title}
          </h3>
          {(showHoursOnly ? hoursAgo : date) && (
            <p className="text-xs text-[#6B756E] mt-1 font-thaana">
              {showHoursOnly ? hoursAgo : date}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "trending") {
    return (
      <Link
        to={href}
        className="group flex w-[78vw] shrink-0 snap-start flex-col gap-1 text-right sm:w-[260px] md:w-auto md:min-w-0"
        dir="rtl"
      >
        {typeof index === "number" && (
          <span className="text-lg font-serif font-bold text-[#8DB99A] leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {article.category && (
          <span className="category-label font-thaana">
            {article.category.name}
          </span>
        )}
        <h3 className="font-article-title text-xl font-semibold text-[#142820] group-hover:text-[#103820] transition-colors line-clamp-2">
          {article.title}
        </h3>
        {showHoursOnly && hoursAgo && (
          <span className="text-xs text-[#6B756E] font-thaana">{hoursAgo}</span>
        )}
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={href}
        className="group flex min-w-0 max-w-full gap-3 items-start py-3 border-b border-[#E5E7E2] last:border-0 flex-row-reverse"
        dir="rtl"
      >
        <div className="flex-1 text-right">
          {article.category && (
            <span className="category-label block mb-1 font-thaana">
              {article.category.name}
            </span>
          )}
          <h3 className="font-article-title text-xl font-medium text-[#142820] group-hover:text-[#103820] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {(showHoursOnly ? hoursAgo : date) && (
            <p className="text-xs text-[#6B756E] mt-1 font-thaana">
              {showHoursOnly ? hoursAgo : date}
            </p>
          )}
        </div>
        {article.featured_image_url && (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-24 h-20 object-cover rounded-sm flex-shrink-0"
            loading="lazy"
          />
        )}
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="group min-w-0 max-w-full bg-white border border-[#E5E7E2] rounded-sm overflow-hidden hover:shadow-md transition-shadow"
      dir="rtl"
    >
      {article.featured_image_url ? (
        <img
          src={article.featured_image_url}
          alt={article.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-56"
          loading="lazy"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-[#D8E8D8] sm:h-56">
          <span className="font-thaana text-[#103820] text-2xl font-bold opacity-30">
            ރ
          </span>
        </div>
      )}
      <div className="p-4 text-right">
        {article.category && (
          <span className="category-label block mb-2 font-thaana">
            {article.category.name}
          </span>
        )}
        <h3 className="font-article-title text-[#142820] font-semibold leading-snug line-clamp-3 mb-2 group-hover:text-[#103820] transition-colors text-2xl">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-[#6B756E] thaana-body line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#6B756E] font-thaana justify-end">
          {showHoursOnly ? (
            hoursAgo && <span>{hoursAgo}</span>
          ) : (
            <>
              {date && <span>{date}</span>}
              {authorName && date && <span>·</span>}
              {authorName && (
                <AuthorIdentity author={article.author} isDhivehi />
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
