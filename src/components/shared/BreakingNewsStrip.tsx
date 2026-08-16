import { Link } from "react-router-dom";
import type { Article } from "../../lib/database.types.ts";
import { Skeleton } from "../ui/skeleton.tsx";

export default function BreakingNewsStrip({
  articles,
  language,
  isLoading = false,
}: {
  articles: Article[];
  language: "english" | "dhivehi";
  isLoading?: boolean;
}) {
  const isDhivehi = language === "dhivehi";
  const moreHref = isDhivehi ? "/news" : "/en/news";

  return (
    <section
      className="border-y border-[#D8DED9] bg-white"
      dir={isDhivehi ? "rtl" : "ltr"}
      aria-label={isDhivehi ? "ވަގުތު ހަބަރު" : "Breaking news"}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2.5">
        <span
          className={`shrink-0 rounded-sm bg-[#A61E2A] px-2.5 py-1 text-[10px] font-bold text-white ${
            isDhivehi ? "font-thaana" : "tracking-[0.12em]"
          }`}
        >
          {isDhivehi ? "ވަގުތު ހަބަރު" : "BREAKING"}
        </span>

        {isLoading ? (
          <Skeleton className="h-5 min-w-0 flex-1" />
        ) : (
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-3 overflow-x-auto whitespace-nowrap">
            {articles.slice(0, 4).map((article, index) => (
              <span key={article.id} className="inline-flex items-center gap-3">
                {index > 0 && (
                  <span
                    className="h-1 w-1 rounded-full bg-[#52B788]"
                    aria-hidden="true"
                  />
                )}
                <Link
                  to={
                    isDhivehi
                      ? `/article/${article.slug}`
                      : `/en/article/${article.slug}`
                  }
                  className={`text-xs font-medium text-[#36463E] transition-colors hover:text-[#103820] ${isDhivehi ? "font-thaana" : ""}`}
                >
                  {article.title}
                </Link>
              </span>
            ))}
          </div>
        )}

        <Link
          to={moreHref}
          className={`shrink-0 border-s border-[#D8DED9] ps-3 text-xs font-semibold text-[#2D6A4F] hover:text-[#103820] ${isDhivehi ? "font-thaana" : ""}`}
        >
          {isDhivehi ? "އިތުރު އަޕްޑޭޓްތައް" : "More updates"}
        </Link>
      </div>
    </section>
  );
}
