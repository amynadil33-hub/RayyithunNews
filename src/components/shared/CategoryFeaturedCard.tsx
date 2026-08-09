import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { Article } from "../../lib/database.types.ts";
import AuthorIdentity from "./AuthorIdentity.tsx";
import { getPublicAuthorName } from "../../lib/author-display.ts";

interface CategoryFeaturedCardProps {
  article: Article;
  isDhivehi?: boolean;
}

export default function CategoryFeaturedCard({
  article,
  isDhivehi = false,
}: CategoryFeaturedCardProps) {
  const href = isDhivehi
    ? `/article/${article.slug}`
    : `/en/article/${article.slug}`;
  const date = article.published_at
    ? format(new Date(article.published_at), "d MMM yyyy")
    : "";
  const authorName = article.show_author
    ? getPublicAuthorName(article.author)
    : null;

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-sm border border-[#DCE2DD] bg-white shadow-sm transition-shadow hover:shadow-md"
      dir={isDhivehi ? "rtl" : "ltr"}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#D8E8D8] sm:aspect-video">
        {article.featured_image_url ? (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#103820]">
            <span className="font-serif text-4xl font-bold text-white/20">
              RAYYITHUN
            </span>
          </div>
        )}
      </div>

      <div
        className={`p-5 sm:p-6 md:p-8 ${
          isDhivehi ? "text-right font-thaana" : "text-left"
        }`}
      >
        {article.category && (
          <span className="category-label mb-3 block text-[#2D6A4F]">
            {article.category.name}
          </span>
        )}

        <h2
          className={`font-article-title max-w-4xl font-bold text-[#142820] transition-colors group-hover:text-[#2D6A4F] line-clamp-3 ${
            isDhivehi
              ? "text-4xl leading-[1.4] sm:text-5xl"
              : "text-3xl leading-tight sm:text-4xl"
          }`}
        >
          {article.title}
        </h2>

        {article.excerpt && (
          <p
            className={`mt-3 max-w-3xl text-sm text-[#6B756E] line-clamp-2 sm:text-base ${
              isDhivehi ? "thaana-body leading-[1.9]" : "leading-relaxed"
            }`}
          >
            {article.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B756E]">
          {authorName && <AuthorIdentity author={article.author} />}
          {authorName && date && <span aria-hidden="true">·</span>}
          {date && <span>{date}</span>}
          {article.read_time && (
            <>
              <span aria-hidden="true">·</span>
              <span>{article.read_time} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
