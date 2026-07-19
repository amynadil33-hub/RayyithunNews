import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { Article } from "../../lib/database.types.ts";

interface DhivehiArticleCardProps {
  article: Article;
  variant?: "hero" | "secondary" | "grid" | "compact" | "trending";
  index?: number;
}

export default function DhivehiArticleCard({ article, variant = "grid", index }: DhivehiArticleCardProps) {
  const href = `/article/${article.slug}`;
  const date = article.published_at
    ? format(new Date(article.published_at), "d MMM")
    : "";

  if (variant === "hero") {
    return (
      <Link to={href} className="group block relative overflow-hidden rounded-sm bg-[#103820] aspect-[4/3] md:aspect-auto md:h-full min-h-[320px]" dir="rtl">
        {article.featured_image_url && (
          <img src={article.featured_image_url} alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          {article.is_breaking && (
            <span className="breaking-badge inline-block mb-2">ވަގުތު ހަބަރު</span>
          )}
          {article.category && (
            <span className="category-label text-[#95D5B2] block mb-2 font-thaana">{article.category.name}</span>
          )}
          <h2 className="thaana-headline text-white text-xl md:text-2xl font-bold leading-tight text-balance mb-2 group-hover:text-[#95D5B2] transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-white/70 text-sm thaana-body line-clamp-2 mb-3">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-white/50 text-xs font-thaana flex-row-reverse">
            {article.author?.full_name && <span>{article.author.full_name}</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link to={href} className="group flex gap-3 items-start flex-row-reverse" dir="rtl">
        {article.featured_image_url ? (
          <img src={article.featured_image_url} alt={article.title}
            className="w-24 h-16 object-cover rounded-sm flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-24 h-16 bg-[#D8E8D8] flex-shrink-0 rounded-sm flex items-center justify-center">
            <span className="font-thaana text-[#103820] text-xs font-bold">ރ</span>
          </div>
        )}
        <div className="text-right">
          {article.category && (
            <span className="category-label block mb-1 font-thaana">{article.category.name}</span>
          )}
          <h3 className="text-sm font-semibold text-[#142820] thaana-body group-hover:text-[#103820] transition-colors line-clamp-3">
            {article.title}
          </h3>
          {date && <p className="text-xs text-[#6B756E] mt-1 font-thaana">{date}</p>}
        </div>
      </Link>
    );
  }

  if (variant === "trending") {
    return (
      <Link to={href} className="group flex flex-col gap-1 min-w-[200px] md:min-w-0 text-right" dir="rtl">
        {typeof index === "number" && (
          <span className="text-lg font-serif font-bold text-[#8DB99A] leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {article.category && (
          <span className="category-label font-thaana">{article.category.name}</span>
        )}
        <h3 className="text-sm font-semibold text-[#142820] thaana-body group-hover:text-[#103820] transition-colors line-clamp-2">
          {article.title}
        </h3>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={href} className="group flex gap-3 items-start py-3 border-b border-[#E5E7E2] last:border-0 flex-row-reverse" dir="rtl">
        <div className="flex-1 text-right">
          {article.category && (
            <span className="category-label block mb-1 font-thaana">{article.category.name}</span>
          )}
          <h3 className="text-sm font-medium text-[#142820] thaana-body group-hover:text-[#103820] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {date && <p className="text-xs text-[#6B756E] mt-1 font-thaana">{date}</p>}
        </div>
        {article.featured_image_url && (
          <img src={article.featured_image_url} alt={article.title}
            className="w-16 h-12 object-cover rounded-sm flex-shrink-0" loading="lazy" />
        )}
      </Link>
    );
  }

  // Grid card
  return (
    <Link to={href} className="group bg-white border border-[#E5E7E2] rounded-sm overflow-hidden hover:shadow-md transition-shadow" dir="rtl">
      {article.featured_image_url ? (
        <img src={article.featured_image_url} alt={article.title}
          className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300" loading="lazy" />
      ) : (
        <div className="w-full h-44 bg-[#D8E8D8] flex items-center justify-center">
          <span className="font-thaana text-[#103820] text-2xl font-bold opacity-30">ރ</span>
        </div>
      )}
      <div className="p-4 text-right">
        {article.category && (
          <span className="category-label block mb-2 font-thaana">{article.category.name}</span>
        )}
        <h3 className="text-[#142820] font-semibold thaana-headline leading-snug line-clamp-3 mb-2 group-hover:text-[#103820] transition-colors text-base">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-[#6B756E] thaana-body line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#6B756E] font-thaana justify-end">
          {date && <span>{date}</span>}
          {article.author?.full_name && date && <span>·</span>}
          {article.author?.full_name && <span>{article.author.full_name}</span>}
        </div>
      </div>
    </Link>
  );
}
