import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EnglishHeader from "../../components/english/EnglishHeader.tsx";
import EnglishFooter from "../../components/english/EnglishFooter.tsx";
import ArticleCard from "../../components/english/ArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import { useArticles } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../../components/ui/empty.tsx";
import { NewspaperIcon } from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  news: "News",
  education: "Education",
  business: "Business",
  religion: "Religion",
  innovation: "Innovation",
  world: "World",
  citizen: "Citizen",
  market: "Market",
  podcast: "Podcast",
};

export default function EnglishCategory() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(0);
  const limit = 12;

  const { data: articles, isLoading } = useArticles({
    portalSlug: "english",
    categorySlug: category,
    limit,
    offset: page * limit,
  });

  const categoryName = CATEGORY_LABELS[category ?? ""] ?? category ?? "Category";

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>{categoryName} — RAYYITHUN</title>
        <meta name="description" content={`Latest ${categoryName} news from RAYYITHUN.`} />
      </Helmet>

      <EnglishHeader />

      <div className="max-w-5xl mx-auto px-4 pt-4">
        <AdBanner placement="category_top_banner" label="Advertisement" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-b-2 border-[#103820] pb-3 mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#142820]">{categoryName}</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : articles && articles.length > 0 ? (
          <>
            {/* Featured first article */}
            {articles.length > 0 && page === 0 && (
              <div className="mb-8">
                <ArticleCard article={articles[0]} variant="hero" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(page === 0 ? articles.slice(1) : articles).map((article) => (
                <ArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-10">
              {page > 0 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-6 py-2 border border-[#103820] text-[#103820] text-sm font-medium rounded-sm hover:bg-[#103820] hover:text-white transition-colors"
                >
                  ← Previous
                </button>
              )}
              {articles.length === limit && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2 bg-[#103820] text-white text-sm font-medium rounded-sm hover:bg-[#183028] transition-colors"
                >
                  Load More →
                </button>
              )}
            </div>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><NewspaperIcon /></EmptyMedia>
              <EmptyTitle>No articles yet</EmptyTitle>
              <EmptyDescription>Check back soon for the latest {categoryName.toLowerCase()} stories.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <EnglishFooter />
    </div>
  );
}
