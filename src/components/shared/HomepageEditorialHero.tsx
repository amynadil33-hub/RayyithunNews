import { format } from "date-fns";
import { ArrowLeftIcon, ArrowRightIcon, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { Article } from "../../lib/database.types.ts";
import { getArticleImageUrl } from "../../lib/article-images.ts";
import { formatDhivehiRelativeTime } from "../../lib/dhivehi-date.ts";

type HomepageLanguage = "english" | "dhivehi";

function articleHref(article: Article, language: HomepageLanguage) {
  return language === "dhivehi"
    ? `/article/${article.slug}`
    : `/en/article/${article.slug}`;
}

function articleDate(article: Article, language: HomepageLanguage) {
  if (!article.published_at) return "";
  return language === "dhivehi"
    ? formatDhivehiRelativeTime(article.published_at)
    : format(new Date(article.published_at), "d MMM yyyy");
}

function StoryImage({ article }: { article: Article }) {
  const imageUrl = getArticleImageUrl(article.featured_image_url);
  return imageUrl ? (
    <img
      src={imageUrl}
      alt={article.title}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
      loading="eager"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-[#D8E8D8] text-[#2D6A4F]">
      <ImageIcon size={30} aria-hidden="true" />
    </span>
  );
}

function TopStoryCard({
  article,
  language,
}: {
  article: Article;
  language: HomepageLanguage;
}) {
  const isDhivehi = language === "dhivehi";
  const imageUrl = getArticleImageUrl(article.featured_image_url);

  return (
    <Link
      to={articleHref(article, language)}
      className="group flex min-w-0 items-start gap-3 rounded-sm border border-[#E5E7E2] bg-white p-3 shadow-[0_1px_2px_rgba(16,56,32,0.04)] transition-all hover:border-[#B7C7BA] hover:shadow-sm"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-20 w-24 shrink-0 rounded-sm object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-20 w-24 shrink-0 items-center justify-center rounded-sm bg-[#D8E8D8] text-[#2D6A4F]">
          <ImageIcon size={20} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        {article.category && (
          <span className="category-label mb-1 block">
            {article.category.name}
          </span>
        )}
        <span
          className={`block text-lg font-semibold leading-snug text-[#142820] line-clamp-2 transition-colors group-hover:text-[#103820] ${isDhivehi ? "font-article-title" : "font-serif"}`}
        >
          {article.title}
        </span>
        <span className="mt-1 block text-[11px] text-[#6B756E]">
          {articleDate(article, language)}
        </span>
      </span>
    </Link>
  );
}

export default function HomepageEditorialHero({
  article,
  topStories,
  language,
}: {
  article?: Article;
  topStories: Article[];
  language: HomepageLanguage;
}) {
  const isDhivehi = language === "dhivehi";

  if (!article) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-sm border border-[#D8DED9] bg-white text-[#8A958E]">
        <span className={isDhivehi ? "font-thaana" : "font-serif"}>
          {isDhivehi ? "ހަބަރެއް ނެތް" : "No featured story available"}
        </span>
      </div>
    );
  }

  return (
    <div dir={isDhivehi ? "rtl" : "ltr"}>
      <article className="overflow-hidden rounded-sm border border-[#D8DED9] bg-white shadow-[0_4px_18px_rgba(16,56,32,0.07)]">
        <Link
          to={articleHref(article, language)}
          className="group grid md:grid-cols-[minmax(0,1.45fr)_minmax(18rem,1fr)]"
        >
          <div className="aspect-[16/10] min-h-0 overflow-hidden bg-[#D8E8D8] md:aspect-auto md:min-h-[360px]">
            <StoryImage article={article} />
          </div>

          <div className="flex flex-col justify-center border-t border-[#E5E7E2] p-5 sm:p-7 md:border-s md:border-t-0 lg:p-9">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {article.is_breaking && (
                <span className="rounded-sm bg-[#A61E2A] px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                  {isDhivehi ? "ވަގުތު ހަބަރު" : "BREAKING"}
                </span>
              )}
              {article.category && (
                <span className="category-label text-[#2D6A4F]">
                  {article.category.name}
                </span>
              )}
            </div>

            <h1
              className={`text-2xl font-bold text-[#142820] transition-colors group-hover:text-[#2D6A4F] sm:text-3xl ${
                isDhivehi
                  ? "font-article-title leading-[1.5]"
                  : "font-serif leading-tight tracking-[-0.015em]"
              }`}
            >
              {article.title}
            </h1>

            {article.excerpt && (
              <p
                className={`mt-3 text-sm text-[#526159] line-clamp-3 ${
                  isDhivehi ? "thaana-body leading-[1.9]" : "leading-relaxed"
                }`}
              >
                {article.excerpt}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#E5E7E2] pt-4 text-xs text-[#6B756E]">
              <span>{articleDate(article, language)}</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#103820]">
                {isDhivehi ? "ހަބަރު ކިޔާ" : "Read story"}
                {isDhivehi ? (
                  <ArrowLeftIcon size={14} aria-hidden="true" />
                ) : (
                  <ArrowRightIcon size={14} aria-hidden="true" />
                )}
              </span>
            </div>
          </div>
        </Link>
      </article>

      {topStories.length > 0 && (
        <section
          className="mt-5"
          aria-label={isDhivehi ? "މުހިންމު ހަބަރު" : "Top Stories"}
        >
          <h2
            className={`mb-3 text-sm font-bold text-[#103820] ${isDhivehi ? "font-thaana" : "uppercase tracking-[0.12em]"}`}
          >
            {isDhivehi ? "މުހިންމު ހަބަރު" : "Top Stories"}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {topStories.slice(0, 3).map((topStory) => (
              <TopStoryCard
                key={topStory.id}
                article={topStory}
                language={language}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
