import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DhivehiHeader from "../../components/dhivehi/DhivehiHeader.tsx";
import DhivehiFooter from "../../components/dhivehi/DhivehiFooter.tsx";
import DhivehiArticleCard from "../../components/dhivehi/DhivehiArticleCard.tsx";
import AdBanner from "../../components/shared/AdBanner.tsx";
import { useArticles } from "../../hooks/use-portal-data.ts";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../../components/ui/empty.tsx";
import { NewspaperIcon } from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  news: "ހަބަރު",
  education: "ތަޢުލީމް",
  business: "ވިޔަފާރި",
  religion: "ތެދުމަގު",
  innovation: "އުފެއްދުންތެރިކަން",
  world: "ދުނިޔެ",
  citizen: "ރައްޔިތުން",
  market: "ބާޒާރު",
  podcast: "ޕޮޑްކާސްޓް",
};

// Map URL slugs to DB category slugs
const SLUG_MAP: Record<string, string> = {
  news: "dv-news",
  education: "dv-education",
  business: "dv-business",
  religion: "dv-religion",
  innovation: "dv-innovation",
  world: "dv-world",
  citizen: "dv-citizen",
  market: "dv-market",
};

export default function DhivehiCategory() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(0);
  const limit = 12;
  const dbSlug = SLUG_MAP[category ?? ""] ?? category;

  const { data: articles, isLoading } = useArticles({
    portalSlug: "dhivehi",
    categorySlug: dbSlug,
    limit,
    offset: page * limit,
  });

  const categoryName = CATEGORY_LABELS[category ?? ""] ?? category ?? "ބައި";

  return (
    <div className="min-h-screen bg-[#F8F8F8]" dir="rtl" lang="dv">
      <Helmet>
        <title>{categoryName} — ރައްޔިތުން</title>
      </Helmet>

      <DhivehiHeader />

      <div className="max-w-5xl mx-auto px-4 pt-4">
        <AdBanner placement="category_top_banner" label="އިޢުލާން" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="border-b-2 border-[#103820] pb-3 mb-8 text-right">
          <h1 className="font-thaana thaana-headline text-3xl font-bold text-[#142820]">{categoryName}</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : articles && articles.length > 0 ? (
          <>
            {articles.length > 0 && page === 0 && (
              <div className="mb-8">
                <DhivehiArticleCard article={articles[0]} variant="hero" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {(page === 0 ? articles.slice(1) : articles).map((article) => (
                <DhivehiArticleCard key={article.id} article={article} variant="grid" />
              ))}
            </div>
            <div className="flex justify-center gap-3 mt-10">
              {page > 0 && (
                <button onClick={() => setPage(page - 1)}
                  className="px-6 py-2 border border-[#103820] text-[#103820] text-sm font-medium rounded-sm hover:bg-[#103820] hover:text-white transition-colors font-thaana">
                  ← ކުރީ ސަފްހާ
                </button>
              )}
              {articles.length === limit && (
                <button onClick={() => setPage(page + 1)}
                  className="px-6 py-2 bg-[#103820] text-white text-sm font-medium rounded-sm hover:bg-[#183028] transition-colors font-thaana">
                  ތިރިން ލ →
                </button>
              )}
            </div>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><NewspaperIcon /></EmptyMedia>
              <EmptyTitle>ލިޔުންތައް ނެތް</EmptyTitle>
              <EmptyDescription>近ތި ތ ތ ތ.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <DhivehiFooter />
    </div>
  );
}
